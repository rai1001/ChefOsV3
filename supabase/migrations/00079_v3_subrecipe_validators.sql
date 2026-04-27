-- 00079_v3_subrecipe_validators.sql
-- Sprint-08 · sub-recipe consistency validators and recursive chain planning.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create or replace function public.v3_validate_recipe_ingredient_source_recipe()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn_v3_validate_recipe_ingredient_source_recipe$
declare
  v_parent_recipe_id uuid;
  v_source record;
  v_output_unit_id uuid;
begin
  if new.source_recipe_id is null then
    return new;
  end if;

  if new.recipe_id is null or new.hotel_id is null then
    raise exception 'recipe ingredient source recipe requires hotel_id and recipe_id'
      using errcode = 'P0003';
  end if;

  if new.source_recipe_id = new.recipe_id then
    raise exception 'recipe ingredient cannot reference its own recipe as source_recipe_id'
      using errcode = 'P0017';
  end if;

  select r.id
    into v_parent_recipe_id
  from public.v3_recipes r
  where r.id = new.recipe_id
    and r.hotel_id = new.hotel_id;

  if v_parent_recipe_id is null then
    raise exception 'parent recipe not found for source recipe ingredient'
      using errcode = 'P0010';
  end if;

  select
    r.id,
    r.output_product_id,
    r.output_quantity_per_batch
    into v_source
  from public.v3_recipes r
  where r.id = new.source_recipe_id
    and r.hotel_id = new.hotel_id
    and r.is_preparation = true
    and r.status not in ('deprecated', 'archived');

  if v_source.id is null then
    raise exception 'source_recipe_id must reference an active stockable preparation'
      using errcode = 'P0010';
  end if;

  select p.default_unit_id
    into v_output_unit_id
  from public.v3_products p
  where p.id = v_source.output_product_id
    and p.hotel_id = new.hotel_id
    and p.is_active = true;

  if v_output_unit_id is null then
    raise exception 'source recipe output product must have an active default unit'
      using errcode = 'P0003';
  end if;

  if new.product_id is null or new.product_id <> v_source.output_product_id then
    raise exception 'source recipe ingredient product_id must match source recipe output_product_id'
      using errcode = 'P0003';
  end if;

  if new.unit_id is null or new.unit_id <> v_output_unit_id then
    raise exception 'source recipe ingredient unit_id must match output product default_unit_id'
      using errcode = 'P0003';
  end if;

  return new;
end;
$fn_v3_validate_recipe_ingredient_source_recipe$;

drop trigger if exists v3_recipe_ingredients_validate_source_recipe on public.v3_recipe_ingredients;
create trigger v3_recipe_ingredients_validate_source_recipe
  before insert or update on public.v3_recipe_ingredients
  for each row
  execute function public.v3_validate_recipe_ingredient_source_recipe();

create or replace function public.v3_validate_recipe_is_preparation()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn_v3_validate_recipe_is_preparation$
begin
  if old.is_preparation = true and new.is_preparation = false then
    if exists (
      select 1
      from public.v3_recipe_ingredients ri
      where ri.hotel_id = old.hotel_id
        and ri.source_recipe_id = old.id
      limit 1
    ) then
      raise exception 'recipe preparation is in use by recipe ingredients'
        using errcode = 'P0003';
    end if;
  end if;

  return new;
end;
$fn_v3_validate_recipe_is_preparation$;

drop trigger if exists v3_recipes_validate_is_preparation on public.v3_recipes;
create trigger v3_recipes_validate_is_preparation
  before update of is_preparation on public.v3_recipes
  for each row
  execute function public.v3_validate_recipe_is_preparation();

create or replace function public.v3_compute_subrecipe_chain(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_target_servings numeric,
  p_depth integer default 0
)
returns table (
  depth integer,
  parent_recipe_id uuid,
  recipe_id uuid,
  product_id uuid,
  unit_id uuid,
  required numeric,
  available numeric,
  missing numeric,
  output_quantity_per_batch numeric,
  batches_needed numeric,
  target_servings numeric,
  quantity_to_produce numeric,
  will_produce boolean
)
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_compute_subrecipe_chain$
declare
  v_recipe record;
  v_child record;
  v_child_depth integer := coalesce(p_depth, 0) + 1;
  v_available numeric(14,4);
  v_missing numeric(14,4);
  v_batches numeric(14,4);
  v_target_servings numeric(14,4);
  v_quantity_to_produce numeric(14,4);
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  if p_target_servings is null or p_target_servings <= 0 then
    raise exception 'target servings must be > 0' using errcode = 'P0003';
  end if;

  select r.id, r.servings::numeric as servings
    into v_recipe
  from public.v3_recipes r
  where r.id = p_recipe_id
    and r.hotel_id = p_hotel_id
    and r.status not in ('deprecated', 'archived');

  if v_recipe.id is null then
    raise exception 'recipe not found for subrecipe chain' using errcode = 'P0010';
  end if;

  if v_recipe.servings is null or v_recipe.servings <= 0 then
    raise exception 'recipe servings must be > 0 for subrecipe chain'
      using errcode = 'P0003';
  end if;

  for v_child in
    select
      ri.source_recipe_id as recipe_id,
      ri.product_id,
      ri.unit_id,
      round((coalesce(ri.quantity_net, ri.quantity_gross) * (p_target_servings / v_recipe.servings))::numeric, 4) as required,
      sr.servings::numeric as source_servings,
      sr.output_quantity_per_batch::numeric as output_quantity_per_batch
    from public.v3_recipe_ingredients ri
    join public.v3_recipes sr
      on sr.id = ri.source_recipe_id
     and sr.hotel_id = p_hotel_id
     and sr.is_preparation = true
     and sr.status not in ('deprecated', 'archived')
    where ri.hotel_id = p_hotel_id
      and ri.recipe_id = p_recipe_id
      and ri.source_recipe_id is not null
      and ri.product_id is not null
      and ri.unit_id is not null
      and coalesce(ri.quantity_net, ri.quantity_gross) > 0
    order by ri.sort_order, ri.id
  loop
    if v_child_depth > 5 then
      raise exception 'subrecipe cascade too deep for recipe %', p_recipe_id
        using errcode = 'P0017';
    end if;

    if v_child.source_servings is null or v_child.source_servings <= 0 then
      raise exception 'source recipe servings must be > 0'
        using errcode = 'P0003';
    end if;

    if v_child.output_quantity_per_batch is null or v_child.output_quantity_per_batch <= 0 then
      raise exception 'source recipe output_quantity_per_batch must be > 0'
        using errcode = 'P0003';
    end if;

    select coalesce(sum(lot.quantity_remaining), 0)::numeric(14,4)
      into v_available
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.product_id = v_child.product_id
      and lot.quantity_remaining > 0;

    v_missing := greatest((v_child.required - v_available)::numeric, 0)::numeric(14,4);
    v_batches := case
      when v_missing > 0 then ceil(v_missing / v_child.output_quantity_per_batch)::numeric(14,4)
      else 0::numeric(14,4)
    end;
    v_target_servings := (v_child.source_servings * v_batches)::numeric(14,4);
    v_quantity_to_produce := (v_child.output_quantity_per_batch * v_batches)::numeric(14,4);

    depth := v_child_depth;
    parent_recipe_id := p_recipe_id;
    recipe_id := v_child.recipe_id;
    product_id := v_child.product_id;
    unit_id := v_child.unit_id;
    required := v_child.required::numeric(14,4);
    available := v_available;
    missing := v_missing;
    output_quantity_per_batch := v_child.output_quantity_per_batch::numeric(14,4);
    batches_needed := v_batches;
    target_servings := v_target_servings;
    quantity_to_produce := v_quantity_to_produce;
    will_produce := v_missing > 0;

    return next;

    if v_missing > 0 then
      return query
      select *
      from public.v3_compute_subrecipe_chain(
        p_hotel_id,
        v_child.recipe_id,
        v_target_servings,
        v_child_depth
      );
    end if;
  end loop;
end;
$fn_v3_compute_subrecipe_chain$;

revoke all on function public.v3_validate_recipe_ingredient_source_recipe() from public, anon, authenticated;
grant execute on function public.v3_validate_recipe_ingredient_source_recipe() to postgres, service_role;

revoke all on function public.v3_validate_recipe_is_preparation() from public, anon, authenticated;
grant execute on function public.v3_validate_recipe_is_preparation() to postgres, service_role;

revoke all on function public.v3_compute_subrecipe_chain(uuid, uuid, numeric, integer) from public, anon, authenticated;
grant execute on function public.v3_compute_subrecipe_chain(uuid, uuid, numeric, integer) to authenticated;
