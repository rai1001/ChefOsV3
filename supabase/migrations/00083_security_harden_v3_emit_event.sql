-- 00083_security_harden_v3_emit_event.sql
-- Harden internal event bus helper: prevent direct RPC use of SECURITY DEFINER emitter.

revoke all on function public.v3_emit_event(uuid, text, uuid, text, jsonb, integer) from public, anon, authenticated;
