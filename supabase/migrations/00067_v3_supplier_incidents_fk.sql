-- 00067_v3_supplier_incidents_fk.sql
-- Sprint-05b · restore ADR-0015 deferred FK to v3_purchase_orders.

update public.v3_supplier_incidents si
set purchase_order_id = null
where si.purchase_order_id is not null
  and not exists (
    select 1
    from public.v3_purchase_orders po
    where po.hotel_id = si.hotel_id
      and po.id = si.purchase_order_id
  );

do $constraints_v3_supplier_incidents_po$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'v3_supplier_incidents_po_fkey'
  ) then
    alter table public.v3_supplier_incidents
      add constraint v3_supplier_incidents_po_fkey
      foreign key (hotel_id, purchase_order_id)
      references public.v3_purchase_orders(hotel_id, id)
      on delete set null (purchase_order_id);
  end if;
end $constraints_v3_supplier_incidents_po$;
