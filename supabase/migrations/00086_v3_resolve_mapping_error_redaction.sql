-- 00086_v3_resolve_mapping_error_redaction.sql
-- Redefine la RPC v3 activa para no exponer mensajes internos de Postgres
-- en failed[] y mantener el cambio aplicable sobre bases ya migradas.

create or replace function public.v3_resolve_ingredient_mapping_bulk(
  p_hotel_id uuid, p_mapping jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $fn_resolve_mapping_redacted$
declare
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
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin', 'direction', 'admin']::public.v3_app_role[]
  );

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
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'missing_keys'
        ));
        continue;
      end if;

      v_ingredient_name_normalized := trim(lower(v_ingredient_name_raw));

      if v_product_id is not null then
        select hotel_id into v_product_hotel from public.v3_products where id = v_product_id;
        if v_product_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_not_found'
          ));
          continue;
        end if;
        if v_product_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      if v_unit_id is not null then
        select hotel_id into v_unit_hotel from public.v3_units_of_measure where id = v_unit_id;
        if v_unit_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_not_found'
          ));
          continue;
        end if;
        if v_unit_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      select count(*) into v_count_matches
        from public.v3_recipe_ingredients
        where hotel_id = p_hotel_id and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      if v_count_matches = 0 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'no_match'
        ));
        continue;
      elsif v_count_matches > 1 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'ambiguous'
        ));
        continue;
      end if;

      update public.v3_recipe_ingredients
        set product_id = v_product_id, unit_id = v_unit_id
        where hotel_id = p_hotel_id and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      get diagnostics v_affected = row_count;

      if v_affected = 1 then
        v_ok_count := v_ok_count + 1;
      else
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'update_failed'
        ));
      end if;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_failed := v_failed || jsonb_build_array(jsonb_build_object(
        'recipe_id', v_recipe_id,
        'ingredient_name', v_ingredient_name_raw,
        'reason', 'exception'
      ));
    end;
  end loop;

  return jsonb_build_object(
    'ok_count', v_ok_count, 'failed_count', v_failed_count, 'failed', v_failed
  );
end;
$fn_resolve_mapping_redacted$;

revoke all on function public.v3_resolve_ingredient_mapping_bulk(uuid, jsonb) from public, anon;
grant execute on function public.v3_resolve_ingredient_mapping_bulk(uuid, jsonb) to authenticated;
