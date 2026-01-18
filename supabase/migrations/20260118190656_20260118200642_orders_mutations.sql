-- No schema changes; ensure RLS allows insert/update for org members
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'purchase_orders' and policyname = 'Purchase orders insertable by members'
  ) then
    execute $p$ create policy "Purchase orders insertable by members"
      on public.purchase_orders
      for insert
      with check (is_org_member(org_id)); $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'purchase_orders' and policyname = 'Purchase orders updatable by members'
  ) then
    execute $p$ create policy "Purchase orders updatable by members"
      on public.purchase_orders
      for update
      using (is_org_member(org_id))
      with check (is_org_member(org_id)); $p$;
  end if;
end $$;
