-- Sprint-04b · módulo `catalog` · trigger price_history + RPCs offers
-- ADR-0014 (04b). Todas las tablas ya existen en v2 (suppliers, supplier_configs,
-- supplier_offers, product_supplier_refs, price_history).
--
-- Esta migración añade:
-- 1. Trigger `price_history_from_offer` — INSERT/UPDATE en supplier_offers
--    genera registro en price_history cuando unit_price cambia.
-- 2. RPC `mark_offer_preferred` — garantiza 0 o 1 preferred por (hotel, product).
-- 3. RPC `get_catalog_prices` — precedencia offer_preferred > cheapest_valid.
--
-- Idempotente. Aplicar vía MCP apply_migration.

-- ─── 1. Trigger: price_history desde supplier_offers ─────────────────────────

create or replace function public.tg_price_history_from_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn_price_hist$
declare
  v_old_price numeric;
  v_variation numeric;
begin
  if tg_op = 'INSERT' then
    v_old_price := null;
  elsif tg_op = 'UPDATE' then
    if old.unit_price = new.unit_price then
      return new; -- no cambio de precio, no historiar
    end if;
    v_old_price := old.unit_price;
  else
    return new;
  end if;

  if v_old_price is not null and v_old_price > 0 then
    v_variation := ((new.unit_price - v_old_price) / v_old_price) * 100;
  else
    v_variation := null;
  end if;

  insert into public.price_history (
    hotel_id, product_id, supplier_id, offer_id,
    recorded_at, old_price, new_price, variation_pct
  ) values (
    new.hotel_id, new.product_id, new.supplier_id, new.id,
    now(), v_old_price, new.unit_price, v_variation
  );

  return new;
end;
$fn_price_hist$;

drop trigger if exists price_history_from_offer on public.supplier_offers;
create trigger price_history_from_offer
  after insert or update of unit_price on public.supplier_offers
  for each row execute function public.tg_price_history_from_offer();

-- ─── 2. RPC mark_offer_preferred ─────────────────────────────────────────────
--
-- Marca una oferta como preferida y desmarca todas las demás del mismo
-- (hotel_id, product_id). Atómico en un solo UPDATE para evitar races.

create or replace function public.mark_offer_preferred(
  p_hotel_id uuid,
  p_offer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $fn_mark_preferred$
declare
  v_role public.app_role;
  v_product_id uuid;
  v_offer_hotel uuid;
begin
  v_role := public.get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin', 'procurement') then
    raise exception 'role % cannot mark offers preferred', v_role using errcode = '42501';
  end if;

  select hotel_id, product_id into v_offer_hotel, v_product_id
    from public.supplier_offers where id = p_offer_id;
  if v_offer_hotel is null then
    raise exception 'offer % not found', p_offer_id using errcode = '42704';
  end if;
  if v_offer_hotel <> p_hotel_id then
    raise exception 'offer does not belong to hotel' using errcode = '42501';
  end if;

  -- Atómico: unset otras + set ésta.
  update public.supplier_offers
    set is_preferred = (id = p_offer_id),
        updated_at = now()
    where hotel_id = p_hotel_id
      and product_id = v_product_id;
end;
$fn_mark_preferred$;

revoke all on function public.mark_offer_preferred(uuid, uuid) from public;
grant execute on function public.mark_offer_preferred(uuid, uuid) to authenticated;

-- ─── 3. RPC get_catalog_prices ───────────────────────────────────────────────
--
-- Devuelve precio catálogo por product_id con precedencia:
--   1. offer donde is_preferred = true AND vigente
--   2. offer vigente más barata (cheapest) si no hay preferred
--   3. null si no hay ofertas válidas
--
-- "Vigente" = valid_from is null or valid_from <= current_date
--           AND valid_to is null or valid_to >= current_date
--
-- Devuelve jsonb: [{ product_id, price, unit_id, supplier_id, offer_id, source,
-- is_preferred, currency (placeholder EUR) }]

create or replace function public.get_catalog_prices(
  p_hotel_id uuid,
  p_product_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_get_prices$
declare
  v_role public.app_role;
  v_result jsonb;
begin
  v_role := public.get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;

  if p_product_ids is null or array_length(p_product_ids, 1) is null then
    return '[]'::jsonb;
  end if;

  with valid_offers as (
    select
      o.product_id,
      o.id as offer_id,
      o.supplier_id,
      o.unit_id,
      o.unit_price,
      o.is_preferred,
      row_number() over (
        partition by o.product_id
        order by
          o.is_preferred desc,
          o.unit_price asc,
          o.updated_at desc
      ) as rnk
    from public.supplier_offers o
    where o.hotel_id = p_hotel_id
      and o.product_id = any(p_product_ids)
      and (o.valid_from is null or o.valid_from <= current_date)
      and (o.valid_to is null or o.valid_to >= current_date)
  ),
  picked as (
    select * from valid_offers where rnk = 1
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'product_id', pid,
    'price', price,
    'unit_id', unit_id,
    'supplier_id', supplier_id,
    'offer_id', offer_id,
    'source', source,
    'is_preferred', is_preferred,
    'currency', 'EUR'
  )), '[]'::jsonb) into v_result
  from (
    -- Para cada product_id input, devolver su precio o null
    select
      pid,
      p.unit_price as price,
      p.unit_id,
      p.supplier_id,
      p.offer_id,
      case when p.is_preferred then 'offer_preferred' else 'offer_cheapest' end as source,
      p.is_preferred
    from unnest(p_product_ids) as pid
    left join picked p on p.product_id = pid
  ) r;

  return v_result;
end;
$fn_get_prices$;

revoke all on function public.get_catalog_prices(uuid, uuid[]) from public;
grant execute on function public.get_catalog_prices(uuid, uuid[]) to authenticated;
