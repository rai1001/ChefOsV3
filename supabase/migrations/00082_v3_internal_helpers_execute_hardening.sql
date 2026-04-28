-- 00082_v3_internal_helpers_execute_hardening.sql
-- Security fix: internal SECURITY DEFINER helpers must not be callable from API roles.

revoke all on function public.v3_emit_event(uuid, text, uuid, text, jsonb, integer)
  from public, anon, authenticated;

revoke all on function public.v3__calculate_recipe_cost_recursive(uuid, uuid, uuid[], integer)
  from public, anon, authenticated;
