-- RPC: dashboard_rolling_grid (eventos próximos y pedidos abiertos)
create or replace function public.dashboard_rolling_grid(p_org uuid)
returns table (
  event_id uuid,
  event_title text,
  hotel_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  purchase_order_id uuid,
  purchase_status public.purchase_status
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    e.id,
    e.title,
    h.name,
    e.starts_at,
    e.ends_at,
    po.id,
    po.status
  from public.events e
  join public.hotels h on h.id = e.hotel_id and h.org_id = p_org
  left join public.purchase_orders po on po.org_id = p_org and po.hotel_id = e.hotel_id
  where e.org_id = p_org
    and e.starts_at >= now() - interval '1 day'
    and e.starts_at <= now() + interval '14 day'
  order by e.starts_at asc;
end;
$$;

-- RPC: dashboard_event_highlights (conteos)
create or replace function public.dashboard_event_highlights(p_org uuid)
returns table (
  upcoming_events integer,
  open_orders integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    (select count(*) from public.events where org_id = p_org and starts_at >= now())::integer,
    (select count(*) from public.purchase_orders where org_id = p_org and status in ('draft','approved','ordered'))::integer;
end;
$$;
