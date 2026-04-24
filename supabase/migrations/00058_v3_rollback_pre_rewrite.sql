-- 00058_v3_rollback_pre_rewrite.sql
-- ADR-0015: rewrite total del schema v3 con prefijo v3_.
-- Esta migración quita los objetos que v3 creó en sprints 02b/03c/04a/04b
-- sobre el schema public sin prefijo. NO toca tablas v2, pg_trgm ni helpers v2.
-- Idempotente: cada drop lleva "if exists".

-- 1. Triggers v3-creados sobre tablas v2
drop trigger if exists price_history_from_offer on public.supplier_offers;

-- 2. Policies v3-creadas sobre tablas v2
drop policy if exists price_history_insert_members on public.price_history;

-- 3. Funciones v3-creadas (trigger fn + 9 RPCs). cascade por si quedan
--    dependencias inesperadas (no debería haber, pero seguro).
drop function if exists public.tg_price_history_from_offer() cascade;

drop function if exists public.create_invite(uuid, text, public.app_role);
drop function if exists public.accept_invite(text);
drop function if exists public.revoke_invite(uuid);
drop function if exists public.preview_invite(text);

drop function if exists public.import_recipes_bulk(uuid, jsonb);

drop function if exists public.match_product_by_alias(uuid, text, integer);
drop function if exists public.resolve_ingredient_mapping_bulk(uuid, jsonb);

drop function if exists public.mark_offer_preferred(uuid, uuid);

-- 2 sobrecargas
drop function if exists public.get_catalog_prices(uuid);
drop function if exists public.get_catalog_prices(uuid, uuid[]);

-- 4. Tablas v3-creadas
drop table if exists public.invites cascade;
drop table if exists public.import_runs cascade;

-- 5. Enums v3-creados
drop type if exists public.import_kind cascade;
drop type if exists public.import_status cascade;

-- 6. Conservado (NO dropear):
--    - Helpers v2: is_member_of, get_member_role, check_membership (2 sobrecargas).
--    - Extensión pg_trgm.
--    - Índices trigram sobre v2: products_name_trgm, product_aliases_alias_name_trgm.
--    - Cualquier otro objeto v2 pre-existente.
