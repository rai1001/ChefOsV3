-- Sprint-03c · módulo `import` · log de import_runs + RPC import_recipes_bulk
-- ADR-0013 (decisions-log). Numeración segura: 00053 fue invites.
-- Solo CREA objetos nuevos. No modifica schema existente.
--
-- Aplicar en Supabase Dashboard → SQL editor → Run.

begin;

-- ─── 1. Enums ────────────────────────────────────────────────────────────────

do $$ begin
  create type public.import_kind as enum ('recipes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.import_status as enum (
    'pending', 'running', 'completed', 'partial', 'failed'
  );
exception when duplicate_object then null; end $$;

-- ─── 2. Tabla import_runs ────────────────────────────────────────────────────

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  kind public.import_kind not null,
  status public.import_status not null default 'pending',
  total_rows int not null default 0 check (total_rows >= 0),
  ok_rows int not null default 0 check (ok_rows >= 0),
  failed_rows int not null default 0 check (failed_rows >= 0),
  errors jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  started_at timestamptz not null default now(),
  finished_at timestamptz null
);

create index if not exists import_runs_hotel_id_idx on public.import_runs (hotel_id);
create index if not exists import_runs_kind_idx on public.import_runs (kind);
create index if not exists import_runs_started_at_idx on public.import_runs (started_at desc);

-- ─── 3. RLS ──────────────────────────────────────────────────────────────────

alter table public.import_runs enable row level security;

-- Admin/direction/superadmin del hotel pueden listar los runs del hotel.
create policy "import_runs_select_admin"
  on public.import_runs
  for select
  using (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
  );

-- Insert se hace exclusivamente vía RPC SECURITY DEFINER (no policy permisiva).
-- Update/Delete: solo via RPC también — sin policy.

-- ─── 4. RPC import_recipes_bulk ──────────────────────────────────────────────
--
-- Contrato:
--   p_hotel_id  uuid    — hotel destino
--   p_payload   jsonb   — { recipes: [...], ingredients: [...] }
--     recipes[]      = { name, category, servings, description?, subcategory?,
--                        prep_time_min?, cook_time_min?, rest_time_min?,
--                        target_price?, allergens?[], dietary_tags?[], notes?,
--                        difficulty? }
--     ingredients[]  = { recipe_name, ingredient_name, quantity_gross,
--                        waste_pct?, unit_cost?, sort_order?,
--                        preparation_notes? }
--
-- Comportamiento:
--   - Valida membership admin/direction/superadmin (CHECK MEMBERSHIP).
--   - Crea import_run con status 'running'.
--   - Itera recipes: insert con status='draft'. Si falla (duplicate name,
--     check violation), añade a errors[] y continúa.
--   - Itera ingredients: lookup recipe por name (case-insensitive trim) en
--     map de ids creados; insert con product_id/unit_id NULL.
--   - Marca run con status 'completed' (sin fallos), 'partial' (algunos fallos),
--     'failed' (ningún ok).
--   - Devuelve { run_id, ok_count, failed[] }.
--
-- IMPORTANTE: NO transacción global por-fila. Cada recipe se commitea via
-- savepoint para que un fallo no aborte las demás (atomicidad parcial).

create or replace function public.import_recipes_bulk(
  p_hotel_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role public.app_role;
  v_run_id uuid;
  v_recipe jsonb;
  v_ingredient jsonb;
  v_recipe_id uuid;
  v_recipe_name text;
  v_recipe_name_normalized text;
  v_name_to_id jsonb := '{}'::jsonb;
  v_ok_count int := 0;
  v_failed_count int := 0;
  v_total_count int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_row_index int := 0;
  v_error_message text;
begin
  -- Validación membership: solo admin/direction/superadmin pueden importar.
  v_role := public.get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin') then
    raise exception 'role % cannot import recipes', v_role using errcode = '42501';
  end if;

  -- Validación payload mínima.
  if p_payload is null
     or jsonb_typeof(p_payload->'recipes') <> 'array'
     or jsonb_typeof(p_payload->'ingredients') <> 'array'
  then
    raise exception 'payload must contain recipes[] and ingredients[]'
      using errcode = '22023';
  end if;

  v_total_count := jsonb_array_length(p_payload->'recipes')
                 + jsonb_array_length(p_payload->'ingredients');

  -- Crear run.
  insert into public.import_runs (hotel_id, kind, status, total_rows, created_by)
    values (p_hotel_id, 'recipes', 'running', v_total_count, v_user_id)
    returning id into v_run_id;

  -- ─── Iterar recipes ─────────────────────────────────────────────────────
  for v_row_index, v_recipe in
    select ord, val from jsonb_array_elements(p_payload->'recipes') with ordinality as t(val, ord)
  loop
    v_recipe_name := trim(v_recipe->>'name');
    v_recipe_name_normalized := lower(regexp_replace(v_recipe_name, '\s+', ' ', 'g'));

    begin
      insert into public.recipes (
        hotel_id, name, description, category, subcategory, servings,
        yield_qty, yield_unit_id, prep_time_min, cook_time_min, rest_time_min,
        difficulty, status, target_price, allergens, dietary_tags, notes, image_url,
        created_by
      ) values (
        p_hotel_id,
        v_recipe_name,
        nullif(v_recipe->>'description', ''),
        (v_recipe->>'category')::text,
        nullif(v_recipe->>'subcategory', ''),
        coalesce((v_recipe->>'servings')::int, 1),
        nullif((v_recipe->>'yield_qty'), '')::numeric,
        null,
        nullif((v_recipe->>'prep_time_min'), '')::int,
        nullif((v_recipe->>'cook_time_min'), '')::int,
        nullif((v_recipe->>'rest_time_min'), '')::int,
        coalesce((v_recipe->>'difficulty')::text, 'medium'),
        'draft',
        nullif((v_recipe->>'target_price'), '')::numeric,
        coalesce(
          (select array_agg(value::text) from jsonb_array_elements_text(v_recipe->'allergens')),
          '{}'::text[]
        ),
        coalesce(
          (select array_agg(value::text) from jsonb_array_elements_text(v_recipe->'dietary_tags')),
          '{}'::text[]
        ),
        nullif(v_recipe->>'notes', ''),
        nullif(v_recipe->>'image_url', ''),
        v_user_id
      )
      returning id into v_recipe_id;

      v_name_to_id := v_name_to_id || jsonb_build_object(v_recipe_name_normalized, v_recipe_id);
      v_ok_count := v_ok_count + 1;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'kind', 'recipe',
        'row_index', v_row_index,
        'name', v_recipe_name,
        'error', v_error_message
      ));
    end;
  end loop;

  -- ─── Iterar ingredients ─────────────────────────────────────────────────
  for v_row_index, v_ingredient in
    select ord, val from jsonb_array_elements(p_payload->'ingredients') with ordinality as t(val, ord)
  loop
    declare
      v_target_recipe_id uuid;
      v_target_recipe_name text;
    begin
      v_target_recipe_name := trim(v_ingredient->>'recipe_name');
      v_target_recipe_id := (
        v_name_to_id ->> lower(regexp_replace(v_target_recipe_name, '\s+', ' ', 'g'))
      )::uuid;

      if v_target_recipe_id is null then
        v_failed_count := v_failed_count + 1;
        v_errors := v_errors || jsonb_build_array(jsonb_build_object(
          'kind', 'ingredient',
          'row_index', v_row_index,
          'name', v_target_recipe_name,
          'error', 'recipe not found in this import (recipe_name FK)'
        ));
        continue;
      end if;

      insert into public.recipe_ingredients (
        hotel_id, recipe_id, ingredient_name, product_id, unit_id,
        quantity_gross, waste_pct, unit_cost, sort_order, preparation_notes
      ) values (
        p_hotel_id,
        v_target_recipe_id,
        trim(v_ingredient->>'ingredient_name'),
        null,  -- product_id NULL → mapping pendiente (ADR-0013)
        null,  -- unit_id NULL    → mapping pendiente (ADR-0013)
        coalesce((v_ingredient->>'quantity_gross')::numeric, 0),
        coalesce((v_ingredient->>'waste_pct')::numeric, 0),
        coalesce((v_ingredient->>'unit_cost')::numeric, 0),
        coalesce((v_ingredient->>'sort_order')::int, 0),
        nullif(v_ingredient->>'preparation_notes', '')
      );

      v_ok_count := v_ok_count + 1;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'kind', 'ingredient',
        'row_index', v_row_index,
        'name', coalesce(v_ingredient->>'ingredient_name', ''),
        'error', v_error_message
      ));
    end;
  end loop;

  -- Cerrar run.
  update public.import_runs set
    status = case
      when v_failed_count = 0 then 'completed'::public.import_status
      when v_ok_count = 0 then 'failed'::public.import_status
      else 'partial'::public.import_status
    end,
    ok_rows = v_ok_count,
    failed_rows = v_failed_count,
    errors = v_errors,
    finished_at = now()
  where id = v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id,
    'ok_count', v_ok_count,
    'failed_count', v_failed_count,
    'failed', v_errors
  );
end;
$$;

revoke all on function public.import_recipes_bulk(uuid, jsonb) from public;
grant execute on function public.import_recipes_bulk(uuid, jsonb) to authenticated;

commit;
