create or replace function public.onboard_user_org(
  p_user_id uuid,
  p_org_name text,
  p_org_slug text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_org_id uuid := gen_random_uuid();
  claim_role text := current_setting('request.jwt.claim.role', true);
begin
  if claim_role is distinct from 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.orgs (id, name, slug)
  values (new_org_id, p_org_name, p_org_slug);

  insert into public.org_members (org_id, user_id, role, is_active)
  values (new_org_id, p_user_id, 'admin', true);

  return new_org_id;
end;
$$;
