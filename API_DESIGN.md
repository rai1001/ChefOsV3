# Diseño de API (frontend ↔ Supabase)

## Regla general
Preferir **RLS + anon client**. Usar server-side/edge/RPC solo cuando:
- se necesite operación atómica compleja
- se deban unir muchos datos para evitar N+1
- se requiera privilegio (y esté justificado)

## Acceso a datos
- Lecturas: `select` directo desde UI vía adapter `data`.
- Escrituras simples: `insert/update/delete` con RLS.
- Escrituras complejas/atómicas: RPC (`supabase.rpc`).

## RPCs
- Nombrado: `get_*`, `dashboard_*`, `import_*`, `validate_*`.
- Siempre validar acceso por org (membership) en la función.
- `security definer` + `set search_path = public`.
- Añadir test pgTAP por RPC.

## Errores
- Usar estándar de `ERROR_HANDLING.md`.

## Contratos existentes
- Ver `SPEC_API.md` para lista de RPCs y flujos principales.
