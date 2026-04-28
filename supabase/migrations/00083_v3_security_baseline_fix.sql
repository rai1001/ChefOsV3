-- 00083_v3_security_baseline_fix.sql
-- Sprint hardening-2 — alinea las funciones v3 heredadas (00061 y posteriores)
-- con el patrón v3 baseline consolidado desde sprint-04b:
--   1) set search_path = public (22 funciones que no lo tenían)
--   2) revoke all from public, anon (49 funciones con grant residual a anon)
--   3) grant execute solo a roles autorizados (authenticated/service_role)
--
-- No modifica el cuerpo de ninguna función. Solo cambia metadata
-- (search_path) y privilegios. Sin breaking changes para clientes
-- autenticados; cierra las funciones a anon (advisor 0001 / 0011).
--
-- Esperado post-fix:
--   - function_search_path_mutable v3: 22 → 0
--   - anon_security_definer_function_executable v3: 48 → 0
--   - authenticated_security_definer_function_executable: sin cambio

begin;

-- =====================================================================
-- Lote 1 — set search_path en 22 funciones v3 sin él (migración 00061)
-- =====================================================================
alter function public.v3__calculate_recipe_cost_recursive(uuid, uuid, uuid[], integer) set search_path = public;
alter function public.v3_approve_recipe(uuid, uuid) set search_path = public;
alter function public.v3_calculate_recipe_cost(uuid, uuid) set search_path = public;
alter function public.v3_category_to_department(v3_recipe_category) set search_path = public;
alter function public.v3_check_membership(uuid) set search_path = public;
alter function public.v3_check_membership(uuid, uuid, v3_app_role[]) set search_path = public;
alter function public.v3_create_tenant_with_hotel(text, text, text, text, text) set search_path = public;
alter function public.v3_deprecate_recipe(uuid, uuid) set search_path = public;
alter function public.v3_duplicate_recipe(uuid, uuid) set search_path = public;
alter function public.v3_generate_event_operational_impact(uuid, uuid) set search_path = public;
alter function public.v3_get_active_hotel() set search_path = public;
alter function public.v3_get_event_beo(uuid, uuid) set search_path = public;
alter function public.v3_get_events_calendar(uuid, date, date) set search_path = public;
alter function public.v3_get_member_role(uuid) set search_path = public;
alter function public.v3_get_recipe_tech_sheet(uuid, uuid) set search_path = public;
alter function public.v3_get_team_members(uuid) set search_path = public;
alter function public.v3_get_user_hotels() set search_path = public;
alter function public.v3_is_member_of(uuid) set search_path = public;
alter function public.v3_scale_recipe(uuid, uuid, integer) set search_path = public;
alter function public.v3_submit_recipe_for_review(uuid, uuid) set search_path = public;
alter function public.v3_switch_active_hotel(uuid) set search_path = public;
alter function public.v3_transition_event(uuid, uuid, v3_event_status, text) set search_path = public;
alter function public.v3_validate_event_transition(v3_event_status, v3_event_status) set search_path = public;

-- =====================================================================
-- Lote 2 — revoke from public, anon en 49 funciones v3 con grant residual
-- =====================================================================
-- Patrón: las 7 migraciones afectadas (00054, 00056, 00057, 00061, 00063,
-- 00065, 00066, 00075) hicieron `revoke from public` SIN `, anon`. En
-- Supabase, anon es rol distinto de PUBLIC; el grant a anon persistía.
--
-- Las funciones helper internas (v3_check_membership, v3__calculate_*,
-- v3_validate_*, v3_category_to_department, v3_emit_event, v3_tg_*) se
-- mantienen sin grant a authenticated — solo se invocan desde otras RPCs
-- SECURITY DEFINER que corren como `postgres`.

-- Helpers internos (sin grant a authenticated, solo postgres + service_role)
revoke all on function public.v3__calculate_recipe_cost_recursive(uuid, uuid, uuid[], integer) from public, anon, authenticated;
revoke all on function public.v3_category_to_department(v3_recipe_category) from public, anon, authenticated;
revoke all on function public.v3_check_membership(uuid, uuid, v3_app_role[]) from public, anon, authenticated;
revoke all on function public.v3_emit_event(uuid, text, uuid, text, jsonb, integer) from public, anon, authenticated;
revoke all on function public.v3_tg_price_history_from_offer() from public, anon, authenticated;
revoke all on function public.v3_tg_set_updated_at() from public, anon, authenticated;
revoke all on function public.v3_validate_event_transition(v3_event_status, v3_event_status) from public, anon, authenticated;
revoke all on function public.v3_validate_po_transition(v3_po_status, v3_po_status) from public, anon, authenticated;
revoke all on function public.v3_validate_pr_transition(v3_pr_status, v3_pr_status) from public, anon, authenticated;

-- RPCs de identity / tenancy (grant a authenticated)
revoke all on function public.v3_check_membership(uuid) from public, anon;
revoke all on function public.v3_create_hotel(uuid, text, text, text, text) from public, anon;
revoke all on function public.v3_create_tenant_with_hotel(text, text, text, text, text) from public, anon;
revoke all on function public.v3_get_active_hotel() from public, anon;
revoke all on function public.v3_get_member_role(uuid) from public, anon;
revoke all on function public.v3_get_team_members(uuid) from public, anon;
revoke all on function public.v3_get_user_hotels() from public, anon;
revoke all on function public.v3_is_member_of(uuid) from public, anon;
revoke all on function public.v3_switch_active_hotel(uuid) from public, anon;

grant execute on function public.v3_check_membership(uuid) to authenticated;
grant execute on function public.v3_create_hotel(uuid, text, text, text, text) to authenticated;
grant execute on function public.v3_create_tenant_with_hotel(text, text, text, text, text) to authenticated;
grant execute on function public.v3_get_active_hotel() to authenticated;
grant execute on function public.v3_get_member_role(uuid) to authenticated;
grant execute on function public.v3_get_team_members(uuid) to authenticated;
grant execute on function public.v3_get_user_hotels() to authenticated;
grant execute on function public.v3_is_member_of(uuid) to authenticated;
grant execute on function public.v3_switch_active_hotel(uuid) to authenticated;

-- RPCs de invites
revoke all on function public.v3_accept_invite(text) from public, anon;
revoke all on function public.v3_create_invite(uuid, text, v3_app_role) from public, anon;
revoke all on function public.v3_preview_invite(text) from public, anon;
revoke all on function public.v3_revoke_invite(uuid) from public, anon;

grant execute on function public.v3_accept_invite(text) to authenticated;
grant execute on function public.v3_create_invite(uuid, text, v3_app_role) to authenticated;
grant execute on function public.v3_preview_invite(text) to authenticated;
grant execute on function public.v3_revoke_invite(uuid) to authenticated;

-- RPCs de events
revoke all on function public.v3_calculate_event_cost_estimate(uuid, uuid) from public, anon;
revoke all on function public.v3_create_event(uuid, text, v3_event_type, v3_service_type, date, integer, uuid, time without time zone, time without time zone, text, text) from public, anon;
revoke all on function public.v3_generate_event_operational_impact(uuid, uuid) from public, anon;
revoke all on function public.v3_get_event_beo(uuid, uuid) from public, anon;
revoke all on function public.v3_get_events_calendar(uuid, date, date) from public, anon;
revoke all on function public.v3_transition_event(uuid, uuid, v3_event_status, text) from public, anon;
revoke all on function public.v3_update_event(uuid, uuid, jsonb, text) from public, anon;

grant execute on function public.v3_calculate_event_cost_estimate(uuid, uuid) to authenticated;
grant execute on function public.v3_create_event(uuid, text, v3_event_type, v3_service_type, date, integer, uuid, time without time zone, time without time zone, text, text) to authenticated;
grant execute on function public.v3_generate_event_operational_impact(uuid, uuid) to authenticated;
grant execute on function public.v3_get_event_beo(uuid, uuid) to authenticated;
grant execute on function public.v3_get_events_calendar(uuid, date, date) to authenticated;
grant execute on function public.v3_transition_event(uuid, uuid, v3_event_status, text) to authenticated;
grant execute on function public.v3_update_event(uuid, uuid, jsonb, text) to authenticated;

-- RPCs de recipes
revoke all on function public.v3_approve_recipe(uuid, uuid) from public, anon;
revoke all on function public.v3_calculate_recipe_cost(uuid, uuid) from public, anon;
revoke all on function public.v3_deprecate_recipe(uuid, uuid) from public, anon;
revoke all on function public.v3_duplicate_recipe(uuid, uuid) from public, anon;
revoke all on function public.v3_get_recipe_tech_sheet(uuid, uuid) from public, anon;
revoke all on function public.v3_import_recipes_bulk(uuid, jsonb) from public, anon;
revoke all on function public.v3_scale_recipe(uuid, uuid, integer) from public, anon;
revoke all on function public.v3_submit_recipe_for_review(uuid, uuid) from public, anon;

grant execute on function public.v3_approve_recipe(uuid, uuid) to authenticated;
grant execute on function public.v3_calculate_recipe_cost(uuid, uuid) to authenticated;
grant execute on function public.v3_deprecate_recipe(uuid, uuid) to authenticated;
grant execute on function public.v3_duplicate_recipe(uuid, uuid) to authenticated;
grant execute on function public.v3_get_recipe_tech_sheet(uuid, uuid) to authenticated;
grant execute on function public.v3_import_recipes_bulk(uuid, jsonb) to authenticated;
grant execute on function public.v3_scale_recipe(uuid, uuid, integer) to authenticated;
grant execute on function public.v3_submit_recipe_for_review(uuid, uuid) to authenticated;

-- RPCs de catalog / suppliers / mapping
revoke all on function public.v3_get_catalog_prices(uuid, uuid[]) from public, anon;
revoke all on function public.v3_mark_offer_preferred(uuid, uuid) from public, anon;
revoke all on function public.v3_match_product_by_alias(uuid, text, integer) from public, anon;
revoke all on function public.v3_resolve_ingredient_mapping_bulk(uuid, jsonb) from public, anon;

grant execute on function public.v3_get_catalog_prices(uuid, uuid[]) to authenticated;
grant execute on function public.v3_mark_offer_preferred(uuid, uuid) to authenticated;
grant execute on function public.v3_match_product_by_alias(uuid, text, integer) to authenticated;
grant execute on function public.v3_resolve_ingredient_mapping_bulk(uuid, jsonb) to authenticated;

-- RPCs de procurement (PR/PO/GR)
revoke all on function public.v3_create_purchase_request(uuid, v3_pr_origin, date, uuid, text, jsonb) from public, anon;
revoke all on function public.v3_generate_purchase_order(uuid, uuid[]) from public, anon;
revoke all on function public.v3_generate_purchase_requests_for_event(uuid, uuid) from public, anon;
revoke all on function public.v3_receive_goods(uuid, uuid, jsonb, timestamp with time zone, text) from public, anon;
revoke all on function public.v3_transition_purchase_order(uuid, uuid, v3_po_status, text) from public, anon;
revoke all on function public.v3_transition_purchase_request(uuid, uuid, v3_pr_status, text) from public, anon;

grant execute on function public.v3_create_purchase_request(uuid, v3_pr_origin, date, uuid, text, jsonb) to authenticated;
grant execute on function public.v3_generate_purchase_order(uuid, uuid[]) to authenticated;
grant execute on function public.v3_generate_purchase_requests_for_event(uuid, uuid) to authenticated;
grant execute on function public.v3_receive_goods(uuid, uuid, jsonb, timestamp with time zone, text) to authenticated;
grant execute on function public.v3_transition_purchase_order(uuid, uuid, v3_po_status, text) to authenticated;
grant execute on function public.v3_transition_purchase_request(uuid, uuid, v3_pr_status, text) to authenticated;

-- RPCs de escandallo
revoke all on function public.v3_get_escandallo_live(uuid, uuid) from public, anon;
revoke all on function public.v3_sync_escandallo_prices(uuid, uuid) from public, anon;

grant execute on function public.v3_get_escandallo_live(uuid, uuid) to authenticated;
grant execute on function public.v3_sync_escandallo_prices(uuid, uuid) to authenticated;

commit;
