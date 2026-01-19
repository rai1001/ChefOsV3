-- Solo aplica si existen las tablas de import (para evitar fallo en entornos sin importer)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='import_jobs')
     and exists (select 1 from information_schema.tables where table_schema='public' and table_name='import_rows') then
    create or replace function public.import_commit(p_job_id uuid)
    returns jsonb
    language plpgsql
    security definer
    as $fn$
    declare
      v_job public.import_jobs%rowtype;
      v_row public.import_rows%rowtype;
      v_org_id uuid;
      v_event_id uuid;
      v_touched_ids uuid[] := '{}';
      v_hotel_id uuid;
      v_product_id uuid;
      v_supplier_id uuid;
      v_supplier_name text;
      v_purchase_unit text;
      v_rounding_rule text;
      v_is_primary boolean;
    begin
      select * into v_job from public.import_jobs where id = p_job_id;
      v_org_id := v_job.org_id;

      if v_job.status <> 'validated' then raise exception 'Job must be validated'; end if;
      if (v_job.summary->>'errors')::int > 0 then raise exception 'Cannot commit with errors'; end if;

      for v_row in select * from public.import_rows where job_id = p_job_id order by row_number
      loop
        if v_job.entity = 'suppliers' then
          insert into public.suppliers (org_id, name)
          values (v_org_id, v_row.normalized->>'name')
          on conflict (org_id, name) do nothing;

        elsif v_job.entity = 'supplier_items' then
          insert into public.supplier_items (
            supplier_id, name, purchase_unit, pack_size, rounding_rule, price_per_unit, notes, product_id, is_primary
          )
          values (
            (v_row.normalized->>'supplier_id')::uuid,
            v_row.normalized->>'name',
            v_row.normalized->>'purchase_unit',
            (nullif(v_row.normalized->>'pack_size', ''))::numeric,
            coalesce(v_row.normalized->>'rounding_rule', 'none'),
            (nullif(v_row.normalized->>'price', ''))::numeric,
            v_row.normalized->>'notes',
            (v_row.normalized->>'product_id')::uuid,
            coalesce((v_row.normalized->>'is_primary')::boolean, false)
          )
          on conflict (supplier_id, name) do update
          set purchase_unit = excluded.purchase_unit,
              price_per_unit = excluded.price_per_unit,
              pack_size = excluded.pack_size,
              rounding_rule = excluded.rounding_rule,
              product_id = coalesce(supplier_items.product_id, excluded.product_id),
              is_primary = case when supplier_items.is_primary then true else excluded.is_primary end;

        elsif v_job.entity = 'events' then
          v_hotel_id := (v_row.normalized->>'hotel_id')::uuid;

          insert into public.events (org_id, hotel_id, title, starts_at, ends_at, status, notes)
          values (
            v_org_id,
            v_hotel_id,
            v_row.normalized->>'title',
            (v_row.normalized->>'starts_at')::timestamptz,
            coalesce((v_row.normalized->>'ends_at')::timestamptz, (v_row.normalized->>'starts_at')::timestamptz + interval '1 hour'),
            coalesce(v_row.normalized->>'status', 'confirmed'),
            v_row.normalized->>'notes'
          )
          on conflict (org_id, hotel_id, title, starts_at) do update
          set notes = excluded.notes,
              ends_at = excluded.ends_at
          returning id into v_event_id;

          v_touched_ids := array_append(v_touched_ids, v_event_id);

          if v_row.normalized->>'space_id' is not null then
            update public.space_bookings
            set starts_at = (v_row.normalized->>'starts_at')::timestamptz,
                ends_at = coalesce((v_row.normalized->>'ends_at')::timestamptz, (v_row.normalized->>'starts_at')::timestamptz + interval '1 hour')
            where event_id = v_event_id
              and space_id = (v_row.normalized->>'space_id')::uuid;

            if not found then
              insert into public.space_bookings (id, org_id, event_id, space_id, starts_at, ends_at)
              values (
                gen_random_uuid(),
                v_org_id,
                v_event_id,
                (v_row.normalized->>'space_id')::uuid,
                (v_row.normalized->>'starts_at')::timestamptz,
                coalesce((v_row.normalized->>'ends_at')::timestamptz, (v_row.normalized->>'starts_at')::timestamptz + interval '1 hour')
              );
            end if;
          end if;

        elsif v_job.entity = 'products' then
          insert into public.products (org_id, name, unit)
          values (
            v_org_id,
            v_row.normalized->>'name',
            v_row.normalized->>'unit'
          )
          on conflict (org_id, name) do update
          set unit = excluded.unit
          returning id into v_product_id;

          v_supplier_name := trim(coalesce(v_row.normalized->>'supplier_name', ''));
          if v_supplier_name <> '' then
            v_supplier_id := (v_row.normalized->>'supplier_id')::uuid;
            if v_supplier_id is null then
              insert into public.suppliers (org_id, name)
              values (v_org_id, v_supplier_name)
              on conflict (org_id, name) do nothing;

              select id into v_supplier_id
              from public.suppliers
              where org_id = v_org_id and name = v_supplier_name;
            end if;

            if v_supplier_id is not null then
              v_purchase_unit := coalesce(v_row.normalized->>'purchase_unit', v_row.normalized->>'unit', 'ud');
              v_rounding_rule := coalesce(v_row.normalized->>'rounding_rule', 'none');
              v_is_primary := coalesce((v_row.normalized->>'is_primary')::boolean, false);
              if not v_is_primary then
                perform 1 from public.supplier_items where product_id = v_product_id and is_primary = true;
                if not found then v_is_primary := true; end if;
              end if;

              insert into public.supplier_items (
                supplier_id, name, purchase_unit, pack_size, rounding_rule, price_per_unit, notes, product_id, is_primary
              )
              values (
                v_supplier_id,
                v_row.normalized->>'name',
                v_purchase_unit,
                (nullif(v_row.normalized->>'pack_size', ''))::numeric,
                v_rounding_rule,
                coalesce(
                  (nullif(v_row.normalized->>'price', ''))::numeric,
                  (nullif(v_row.normalized->>'price_per_unit', ''))::numeric,
                  (nullif(v_row.normalized->>'precio', ''))::numeric
                ),
                v_row.normalized->>'notes',
                v_product_id,
                v_is_primary
              )
              on conflict (supplier_id, name) do update
              set purchase_unit = excluded.purchase_unit,
                  price_per_unit = excluded.price_per_unit,
                  pack_size = excluded.pack_size,
                  rounding_rule = excluded.rounding_rule,
                  product_id = coalesce(supplier_items.product_id, excluded.product_id),
                  is_primary = case when supplier_items.is_primary then true else excluded.is_primary end;
            end if;
          end if;

        elsif v_job.entity = 'staff' then
          insert into public.staff_members (
            org_id,
            full_name,
            role,
            employment_type,
            home_hotel_id,
            notes,
            shift_pattern,
            max_shifts_per_week,
            active
          )
          values (
            v_org_id,
            v_row.normalized->>'full_name',
            coalesce(v_row.normalized->>'role', 'cocinero'),
            coalesce(v_row.normalized->>'employment_type', 'fijo'),
            (v_row.normalized->>'home_hotel_id')::uuid,
            v_row.normalized->>'notes',
            coalesce(v_row.normalized->>'shift_pattern', 'rotativo'),
            coalesce((v_row.normalized->>'max_shifts')::int, 5),
            coalesce((v_row.normalized->>'active')::boolean, true)
          )
          on conflict (org_id, full_name) do update
          set role = excluded.role,
              employment_type = excluded.employment_type,
              active = excluded.active;
        end if;
      end loop;

      -- Safe mode: no borramos eventos fuera del set importado
      update public.import_jobs set status = 'committed' where id = p_job_id;

      return v_job.summary;
    end;
    $fn$;
  end if;
end $$;
