-- Sprint-04a · módulo `catalog` · rollback 00055 + RPCs mapping/match + índices trigram
-- ADR-0014 revisado. Descubierto 2026-04-23: v2 ya tiene schema completo de catalog
-- (products, product_aliases, units_of_measure, suppliers, supplier_*, price_history,
-- product_supplier_refs). v3 reutiliza tablas v2 en vez de crear paralelas.
--
-- Esta migración:
-- 1. Droppea las tablas/enum/function/trigger creados en 00055 (código muerto).
-- 2. Añade índices GIN trigram en products.name y product_aliases.alias_name
--    si no existen (pg_trgm ya instalado por 00055).
-- 3. Crea RPC `match_product_by_alias` sobre schema v2 real.
-- 4. Crea RPC `resolve_ingredient_mapping_bulk` sobre schema v2 real.
--
-- Idempotente.
-- Aplicar en Supabase Dashboard → SQL editor → Run.

begin;

-- ─── 1. Rollback de 00055 (código muerto, nada lo referencia) ────────────────

drop trigger if exists unit_conversions_same_kind on public.unit_conversions;
drop function if exists public.tg_unit_conversions_same_kind();

drop table if exists public.hotel_unit_overrides;
drop table if exists public.unit_conversions;
drop table if exists public.units;

drop type if exists public.unit_kind;

-- ─── 2. Índices trigram sobre tablas v2 ──────────────────────────────────────
-- pg_trgm ya instalado por 00055. Índices IF NOT EXISTS (idempotentes).

create index if not exists products_name_trgm
  on public.products using gin (name gin_trgm_ops);

create index if not exists product_aliases_alias_name_trgm
  on public.product_aliases using gin (alias_name gin_trgm_ops);

-- ─── 3. RPC match_product_by_alias ───────────────────────────────────────────
--
-- Busca productos en el hotel por similarity (trigram) contra:
--   - product_aliases.alias_name (con su confidence_score y source_type de v2)
--   - products.name (match por nombre oficial)
-- Devuelve array ordenado por (similarity * confidence_score) desc.

create or replace function public.match_product_by_alias(
  p_hotel_id uuid,
  p_query text,
  p_limit int default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_match_alias$
declare
  v_role public.app_role;
  v_query_trimmed text;
  v_result jsonb;
begin
  -- Cualquier miembro del hotel puede buscar.
  v_role := public.get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;

  v_query_trimmed := trim(p_query);
  if char_length(v_query_trimmed) = 0 then
    return '[]'::jsonb;
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    p_limit := 10;
  end if;

  with matches as (
    -- Match por alias (aplica confidence del v2 schema).
    select
      pa.product_id,
      p.name as product_name,
      pa.alias_name as matched_text,
      (similarity(pa.alias_name, v_query_trimmed) * coalesce(pa.confidence_score, 1.0)) as sim,
      'alias'::text as match_kind,
      pa.source_type::text as source_type
    from public.product_aliases pa
    join public.products p on p.id = pa.product_id
    where pa.hotel_id = p_hotel_id
      and p.is_active = true
      and pa.alias_name % v_query_trimmed

    union all

    -- Match por products.name directo (confidence 1.0).
    select
      p.id as product_id,
      p.name as product_name,
      p.name as matched_text,
      similarity(p.name, v_query_trimmed) as sim,
      'name'::text as match_kind,
      null::text as source_type
    from public.products p
    where p.hotel_id = p_hotel_id
      and p.is_active = true
      and p.name % v_query_trimmed
  ),
  ranked as (
    select distinct on (product_id)
      product_id, product_name, matched_text, sim, match_kind, source_type
    from matches
    order by product_id, sim desc
  )
  select coalesce(jsonb_agg(row_to_json(r)::jsonb order by r.sim desc), '[]'::jsonb)
    into v_result
    from (
      select product_id, product_name, matched_text, sim as similarity, match_kind, source_type
        from ranked
        order by sim desc
        limit p_limit
    ) r;

  return v_result;
end;
$fn_match_alias$;

revoke all on function public.match_product_by_alias(uuid, text, int) from public;
grant execute on function public.match_product_by_alias(uuid, text, int) to authenticated;

-- ─── 4. RPC resolve_ingredient_mapping_bulk ──────────────────────────────────
--
-- Mapea ingredientes de recetas (recipe_ingredients) a product_id + unit_id reales.
-- product_id FK → public.products.id (v2)
-- unit_id    FK → public.units_of_measure.id (v2, per-hotel)
--
-- Payload: { mappings: [{ recipe_id, ingredient_name, product_id|null, unit_id|null }] }
-- Atomicidad parcial (savepoint por fila). Devuelve { ok_count, failed_count, failed[] }.

create or replace function public.resolve_ingredient_mapping_bulk(
  p_hotel_id uuid,
  p_mapping jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_resolve_mapping$
declare
  v_role public.app_role;
  v_entry jsonb;
  v_recipe_id uuid;
  v_ingredient_name_raw text;
  v_ingredient_name_normalized text;
  v_product_id uuid;
  v_unit_id uuid;
  v_product_hotel uuid;
  v_unit_hotel uuid;
  v_affected int;
  v_count_matches int;
  v_ok_count int := 0;
  v_failed_count int := 0;
  v_failed jsonb := '[]'::jsonb;
  v_error_message text;
begin
  v_role := public.get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin') then
    raise exception 'role % cannot map ingredients', v_role using errcode = '42501';
  end if;

  if p_mapping is null or jsonb_typeof(p_mapping->'mappings') <> 'array' then
    raise exception 'payload must contain mappings[] array' using errcode = '22023';
  end if;

  for v_entry in select * from jsonb_array_elements(p_mapping->'mappings')
  loop
    begin
      v_recipe_id := (v_entry->>'recipe_id')::uuid;
      v_ingredient_name_raw := v_entry->>'ingredient_name';
      v_product_id := nullif(v_entry->>'product_id', '')::uuid;
      v_unit_id := nullif(v_entry->>'unit_id', '')::uuid;

      if v_recipe_id is null or v_ingredient_name_raw is null then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id,
          'ingredient_name', v_ingredient_name_raw,
          'reason', 'missing_keys'
        ));
        continue;
      end if;

      v_ingredient_name_normalized := trim(lower(v_ingredient_name_raw));

      -- Validar product_id (si no null) pertenece al hotel.
      if v_product_id is not null then
        select hotel_id into v_product_hotel from public.products where id = v_product_id;
        if v_product_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id,
            'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_not_found'
          ));
          continue;
        end if;
        if v_product_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id,
            'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      -- Validar unit_id (si no null) pertenece al hotel (units_of_measure es per-hotel en v2).
      if v_unit_id is not null then
        select hotel_id into v_unit_hotel from public.units_of_measure where id = v_unit_id;
        if v_unit_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id,
            'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_not_found'
          ));
          continue;
        end if;
        if v_unit_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id,
            'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      -- Contar matches antes de update (detección ambigüedad).
      select count(*) into v_count_matches
        from public.recipe_ingredients
        where hotel_id = p_hotel_id
          and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      if v_count_matches = 0 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id,
          'ingredient_name', v_ingredient_name_raw,
          'reason', 'no_match'
        ));
        continue;
      elsif v_count_matches > 1 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id,
          'ingredient_name', v_ingredient_name_raw,
          'reason', 'ambiguous'
        ));
        continue;
      end if;

      update public.recipe_ingredients
        set product_id = v_product_id,
            unit_id = v_unit_id
        where hotel_id = p_hotel_id
          and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      get diagnostics v_affected = row_count;

      if v_affected = 1 then
        v_ok_count := v_ok_count + 1;
      else
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id,
          'ingredient_name', v_ingredient_name_raw,
          'reason', 'update_failed'
        ));
      end if;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_failed := v_failed || jsonb_build_array(jsonb_build_object(
        'recipe_id', v_recipe_id,
        'ingredient_name', v_ingredient_name_raw,
        'reason', 'exception',
        'error', v_error_message
      ));
    end;
  end loop;

  return jsonb_build_object(
    'ok_count', v_ok_count,
    'failed_count', v_failed_count,
    'failed', v_failed
  );
end;
$fn_resolve_mapping$;

revoke all on function public.resolve_ingredient_mapping_bulk(uuid, jsonb) from public;
grant execute on function public.resolve_ingredient_mapping_bulk(uuid, jsonb) to authenticated;

commit;
