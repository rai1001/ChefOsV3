create or replace function public.is_org_admin(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1
    from public.org_members m
    where m.org_id = org
      and m.user_id = auth.uid()
      and coalesce(m.is_active, true)
      and m.role = 'admin'
  );
$$;

drop policy if exists "Members read their memberships" on public.org_members;
drop policy if exists "Members read org memberships" on public.org_members;

create policy "Members read org memberships"
  on public.org_members
  for select
  using (is_org_member(org_id));

drop policy if exists "Admins insert memberships" on public.org_members;
drop policy if exists "Admins update memberships" on public.org_members;
drop policy if exists "Admins delete memberships" on public.org_members;

create policy "Admins insert memberships"
  on public.org_members
  for insert
  with check (is_org_admin(org_id));

create policy "Admins update memberships"
  on public.org_members
  for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "Admins delete memberships"
  on public.org_members
  for delete
  using (is_org_admin(org_id));

drop policy if exists "Admins insert hotels" on public.hotels;
drop policy if exists "Admins update hotels" on public.hotels;
drop policy if exists "Admins delete hotels" on public.hotels;

create policy "Admins insert hotels"
  on public.hotels
  for insert
  with check (is_org_admin(org_id));

create policy "Admins update hotels"
  on public.hotels
  for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "Admins delete hotels"
  on public.hotels
  for delete
  using (is_org_admin(org_id));

drop policy if exists "Admins insert suppliers" on public.suppliers;
drop policy if exists "Admins update suppliers" on public.suppliers;
drop policy if exists "Admins delete suppliers" on public.suppliers;

create policy "Admins insert suppliers"
  on public.suppliers
  for insert
  with check (is_org_admin(org_id));

create policy "Admins update suppliers"
  on public.suppliers
  for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "Admins delete suppliers"
  on public.suppliers
  for delete
  using (is_org_admin(org_id));

drop policy if exists "Admins insert products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;

create policy "Admins insert products"
  on public.products
  for insert
  with check (is_org_admin(org_id));

create policy "Admins update products"
  on public.products
  for update
  using (is_org_admin(org_id))
  with check (is_org_admin(org_id));

create policy "Admins delete products"
  on public.products
  for delete
  using (is_org_admin(org_id));
