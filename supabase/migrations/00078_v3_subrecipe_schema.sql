-- 00078_v3_subrecipe_schema.sql
-- Sprint-08 · sub-recipes / stockable preparations schema.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

alter table public.v3_recipes
  add column if not exists is_preparation boolean not null default false,
  add column if not exists output_product_id uuid null,
  add column if not exists output_quantity_per_batch numeric(14,4) null;

do $constraints_v3_recipes_preparation$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_recipes_output_product_hotel_fkey') then
    alter table public.v3_recipes
      add constraint v3_recipes_output_product_hotel_fkey
      foreign key (hotel_id, output_product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_recipes_output_quantity_positive_check') then
    alter table public.v3_recipes
      add constraint v3_recipes_output_quantity_positive_check
      check (output_quantity_per_batch is null or output_quantity_per_batch > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_recipes_preparation_output_required_check') then
    alter table public.v3_recipes
      add constraint v3_recipes_preparation_output_required_check
      check (
        is_preparation = false
        or (
          output_product_id is not null
          and output_quantity_per_batch is not null
          and output_quantity_per_batch > 0
        )
      );
  end if;
end $constraints_v3_recipes_preparation$;

create index if not exists v3_recipes_preparation_product_idx
  on public.v3_recipes(hotel_id, output_product_id)
  where is_preparation = true and output_product_id is not null;

alter table public.v3_recipe_ingredients
  add column if not exists source_recipe_id uuid null;

do $constraints_v3_recipe_ingredients_source_recipe$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_recipe_ingredients_source_recipe_hotel_fkey') then
    alter table public.v3_recipe_ingredients
      add constraint v3_recipe_ingredients_source_recipe_hotel_fkey
      foreign key (hotel_id, source_recipe_id)
      references public.v3_recipes(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_recipe_ingredients_source_not_self_check') then
    alter table public.v3_recipe_ingredients
      add constraint v3_recipe_ingredients_source_not_self_check
      check (source_recipe_id is null or source_recipe_id <> recipe_id);
  end if;
end $constraints_v3_recipe_ingredients_source_recipe$;

create index if not exists v3_recipe_ingredients_source_recipe_idx
  on public.v3_recipe_ingredients(hotel_id, source_recipe_id)
  where source_recipe_id is not null;

alter table public.v3_production_order_lines
  add column if not exists source_recipe_id uuid null;

do $constraints_v3_production_order_lines_source_recipe$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_production_order_lines_source_recipe_hotel_fkey') then
    alter table public.v3_production_order_lines
      add constraint v3_production_order_lines_source_recipe_hotel_fkey
      foreign key (hotel_id, source_recipe_id)
      references public.v3_recipes(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_production_order_lines_source_recipe$;

create index if not exists v3_production_order_lines_source_recipe_idx
  on public.v3_production_order_lines(hotel_id, source_recipe_id)
  where source_recipe_id is not null;

alter table public.v3_inventory_lots
  add column if not exists is_preparation boolean not null default false,
  add column if not exists production_order_id uuid null;

do $constraints_v3_inventory_lots_preparation$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_lots_production_order_hotel_fkey') then
    alter table public.v3_inventory_lots
      add constraint v3_inventory_lots_production_order_hotel_fkey
      foreign key (hotel_id, production_order_id)
      references public.v3_production_orders(hotel_id, id)
      on delete set null (production_order_id);
  end if;
end $constraints_v3_inventory_lots_preparation$;

create index if not exists v3_inventory_lots_preparation_fifo_active_idx
  on public.v3_inventory_lots(hotel_id, product_id, is_preparation, received_at asc, id asc)
  where quantity_remaining > 0;

alter type public.v3_inventory_movement_kind add value if not exists 'produce';
