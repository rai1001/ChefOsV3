-- 00066_v3_escandallo_repoint.sql
-- Sprint-05b · close ADR-0015 debt by repointing escandallo RPCs to v3 procurement.

-- migrated from v2 to v3 in sprint-05b 2026-04-26, ADR-0015 debt closed.
create or replace function public.v3_get_escandallo_live(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_get_escandallo_live$
declare
  v_role public.v3_app_role;
  v_result jsonb;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select jsonb_build_object(
    'recipe_id', r.id, 'recipe_name', r.name,
    'category', r.category, 'servings', r.servings, 'status', r.status,
    'target_price', r.target_price,
    'stored_total_cost', r.total_cost,
    'stored_cost_per_serving', r.cost_per_serving,
    'stored_food_cost_pct', r.food_cost_pct,
    'has_price_changes', coalesce((
      select bool_or(
        lp.unit_cost is not null and abs(lp.unit_cost - ri_c.unit_cost) > 0.001
      )
      from public.v3_recipe_ingredients ri_c
      left join lateral (
        select grl.unit_price as unit_cost
        from public.v3_goods_receipt_lines grl
        join public.v3_goods_receipts gr
          on gr.id = grl.goods_receipt_id
         and gr.hotel_id = p_hotel_id
        join public.v3_purchase_order_lines pol
          on pol.id = grl.purchase_order_line_id
         and pol.hotel_id = p_hotel_id
        join public.v3_purchase_orders po
          on po.id = gr.purchase_order_id
         and po.hotel_id = p_hotel_id
        where pol.product_id = ri_c.product_id
          and grl.hotel_id = p_hotel_id
          and grl.quality_status = 'accepted'
          and grl.unit_price is not null
        order by gr.received_at desc, grl.created_at desc
        limit 1
      ) lp on ri_c.product_id is not null
      where ri_c.recipe_id = p_recipe_id and ri_c.hotel_id = p_hotel_id
    ), false),
    'ingredients', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ri.id, 'ingredient_name', ri.ingredient_name,
        'product_id', ri.product_id,
        'quantity_gross', ri.quantity_gross, 'waste_pct', ri.waste_pct,
        'quantity_net', ri.quantity_net,
        'unit_abbreviation', u.abbreviation,
        'unit_cost', ri.unit_cost,
        'line_cost', ri.quantity_net * ri.unit_cost,
        'latest_gr_cost', lp.unit_cost, 'latest_gr_date', lp.received_at,
        'latest_gr_receipt', lp.receipt_id,
        'latest_gr_delivery_note', lp.delivery_note_image_hash,
        'latest_gr_supplier', lp.supplier_name,
        'price_changed', (lp.unit_cost is not null and abs(lp.unit_cost - ri.unit_cost) > 0.001),
        'price_delta', lp.unit_cost - ri.unit_cost,
        'price_delta_pct', case
          when ri.unit_cost > 0 and lp.unit_cost is not null
          then round(((lp.unit_cost - ri.unit_cost) / ri.unit_cost) * 100, 2)
          else null end,
        'line_cost_new', case
          when lp.unit_cost is not null
          then ri.quantity_net * lp.unit_cost
          else ri.quantity_net * ri.unit_cost end
      ) order by ri.sort_order)
      from public.v3_recipe_ingredients ri
      left join public.v3_units_of_measure u on u.id = ri.unit_id
      left join lateral (
        select
          grl.unit_price as unit_cost,
          gr.received_at,
          gr.id as receipt_id,
          gr.delivery_note_image_hash,
          s.name as supplier_name
        from public.v3_goods_receipt_lines grl
        join public.v3_goods_receipts gr
          on gr.id = grl.goods_receipt_id
         and gr.hotel_id = p_hotel_id
        join public.v3_purchase_order_lines pol
          on pol.id = grl.purchase_order_line_id
         and pol.hotel_id = p_hotel_id
        join public.v3_purchase_orders po
          on po.id = gr.purchase_order_id
         and po.hotel_id = p_hotel_id
        join public.v3_suppliers s
          on s.id = po.supplier_id
         and s.hotel_id = p_hotel_id
        where pol.product_id = ri.product_id
          and grl.hotel_id = p_hotel_id
          and grl.quality_status = 'accepted'
          and grl.unit_price is not null
        order by gr.received_at desc, grl.created_at desc
        limit 1
      ) lp on ri.product_id is not null
      where ri.recipe_id = p_recipe_id and ri.hotel_id = p_hotel_id
    ), '[]')
  ) into v_result
  from public.v3_recipes r
  where r.id = p_recipe_id and r.hotel_id = p_hotel_id;

  return v_result;
end;
$fn_v3_get_escandallo_live$;

-- migrated from v2 to v3 in sprint-05b 2026-04-26, ADR-0015 debt closed.
create or replace function public.v3_sync_escandallo_prices(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_sync_escandallo_prices$
declare
  v_role public.v3_app_role;
  v_changes jsonb := '[]';
  v_rec record;
  v_new_total numeric;
  v_servings integer;
  v_target_price numeric;
begin
  v_role := public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]
  );

  for v_rec in
    select ri.id, ri.ingredient_name, ri.unit_cost as old_cost, lp.unit_cost as new_cost
    from public.v3_recipe_ingredients ri
    join lateral (
      select grl.unit_price as unit_cost
      from public.v3_goods_receipt_lines grl
      join public.v3_goods_receipts gr
        on gr.id = grl.goods_receipt_id
       and gr.hotel_id = p_hotel_id
      join public.v3_purchase_order_lines pol
        on pol.id = grl.purchase_order_line_id
       and pol.hotel_id = p_hotel_id
      join public.v3_purchase_orders po
        on po.id = gr.purchase_order_id
       and po.hotel_id = p_hotel_id
      where pol.product_id = ri.product_id
        and grl.hotel_id = p_hotel_id
        and grl.quality_status = 'accepted'
        and grl.unit_price is not null
      order by gr.received_at desc, grl.created_at desc
      limit 1
    ) lp on true
    where ri.recipe_id = p_recipe_id
      and ri.hotel_id = p_hotel_id
      and ri.product_id is not null
      and abs(lp.unit_cost - ri.unit_cost) > 0.001
  loop
    update public.v3_recipe_ingredients
    set unit_cost = v_rec.new_cost
    where id = v_rec.id
      and hotel_id = p_hotel_id;

    v_changes := v_changes || jsonb_build_array(jsonb_build_object(
      'ingredient', v_rec.ingredient_name,
      'old_cost', v_rec.old_cost, 'new_cost', v_rec.new_cost,
      'delta_pct', case
        when v_rec.old_cost > 0
        then round(((v_rec.new_cost - v_rec.old_cost) / v_rec.old_cost) * 100, 2)
        else null
      end
    ));
  end loop;

  if jsonb_array_length(v_changes) > 0 then
    select coalesce(sum(ri.quantity_net * ri.unit_cost), 0),
           r.servings, r.target_price
    into v_new_total, v_servings, v_target_price
    from public.v3_recipe_ingredients ri
    join public.v3_recipes r on r.id = ri.recipe_id
    where ri.recipe_id = p_recipe_id and ri.hotel_id = p_hotel_id
    group by r.servings, r.target_price;

    update public.v3_recipes
    set total_cost = v_new_total,
        cost_per_serving = case when v_servings > 0 then v_new_total / v_servings else 0 end,
        food_cost_pct = case
          when v_target_price > 0 and v_servings > 0
          then round((v_new_total / v_servings / v_target_price) * 100, 2)
          else 0
        end,
        updated_at = now()
    where id = p_recipe_id and hotel_id = p_hotel_id;

    perform public.v3_emit_event(
      p_hotel_id,
      'recipe',
      p_recipe_id,
      'recipe.prices_synced',
      jsonb_build_object(
        'changes_count', jsonb_array_length(v_changes),
        'new_total_cost', v_new_total
      )
    );
  end if;

  return jsonb_build_object(
    'changes_count', jsonb_array_length(v_changes),
    'changes', v_changes
  );
end;
$fn_v3_sync_escandallo_prices$;

revoke all on function public.v3_get_escandallo_live(uuid, uuid) from public;
grant execute on function public.v3_get_escandallo_live(uuid, uuid) to authenticated;

revoke all on function public.v3_sync_escandallo_prices(uuid, uuid) from public;
grant execute on function public.v3_sync_escandallo_prices(uuid, uuid) to authenticated;
