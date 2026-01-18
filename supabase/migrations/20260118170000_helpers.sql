-- Helper para obtener la organización activa del usuario autenticado
create or replace function public.current_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select org_id
  from public.org_members m
  where m.user_id = auth.uid()
    and coalesce(m.is_active, true)
  order by org_id
  limit 1;
$$;
