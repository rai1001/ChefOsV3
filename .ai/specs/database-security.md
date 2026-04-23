# ChefOS v3 Database Security

## Objetivo

Este documento define las reglas de seguridad obligatorias para PostgreSQL + Supabase en ChefOS v3: RLS, RPCs, SECURITY DEFINER, Edge Functions con service_role, y la política de credentials isolation.

Su propósito es evitar:

- exfiltración de credentials vía PostgREST
- bypass de tenancy por confianza en el caller
- search_path hijacking en funciones SECURITY DEFINER
- Edge Functions que actúan sin validar quién las invocó
- acceso a payloads operativos sensibles desde roles no admin

Este documento es normativo.

---

## Principios

1. PostgREST es público por defecto — las RLS deben ser defensivas.
2. Las credentials nunca se exponen por SELECT directo.
3. Las RPCs no confían en el caller: validan membership explícitamente.
4. Las Edge Functions validan el `Authorization` header antes de actuar.
5. Los inputs text se validan contra whitelists.
6. Los roles en policies se leen con `get_member_role()`, no se asumen.

---

## Helpers canónicos

Todas las policies y RPCs consumen tres helpers que viven en la migración de identity:

### `is_member_of(hotel_id uuid) returns boolean`

Devuelve `true` si el usuario autenticado tiene membership activa en el hotel.

**Uso**: policies `SELECT` para metadata (columnas no sensibles) donde basta pertenecer al hotel.

### `get_member_role(hotel_id uuid) returns app_role`

Devuelve el rol del usuario en el hotel, o `NULL` si no es miembro.

**Uso**: policies `SELECT/INSERT/UPDATE/DELETE` donde el acceso depende del rol. También para SELECT de columnas sensibles (credentials, tokens, payloads).

### `check_membership(user_id uuid, hotel_id uuid, required_roles app_role[])`

Lanza excepción `P0001` si el usuario no tiene rol incluido en `required_roles`.

**Uso**: **PRIMERA línea** de toda RPC SECURITY DEFINER.

---

## Regla de oro para tablas con datos sensibles

Toda tabla que almacene:

- credentials, tokens, API keys, passwords
- payloads operativos de terceros (webhooks, responses de integraciones)
- error messages que puedan contener PII o secrets

**NO puede tener** `SELECT USING (is_member_of(hotel_id))`.

Un miembro operativo con la anon key de Supabase puede hacer `.from('tabla').select('columna_sensible')` vía PostgREST y saltarse cualquier RPC saneada.

### Solución

1. **SELECT restringido a admin+**:

   ```sql
   create policy "tabla_select_admin" on public.tabla
     for select using (
       public.get_member_role(hotel_id) in ('superadmin','direction','admin')
     );
   ```

2. **Miembros operativos leen metadata vía RPC SECURITY DEFINER** que proyecta solo columnas no sensibles (nombre, status, timestamps).

3. **Frontend SIEMPRE usa la RPC**, nunca `.from(tabla).select(...)` para estas tablas.

### Tablas sensibles identificadas

Heredadas de v2, aplicadas en migración `00028_security_hardening`:

- `pms_integrations.credentials`
- `pos_integrations.credentials`
- `integration_sync_logs.response_payload`
- `integration_sync_logs.error_message`

Toda tabla nueva con patrón similar debe seguir la misma política desde el primer commit.

---

## SECURITY DEFINER checklist

Toda función `SECURITY DEFINER` debe:

### 1. `SET search_path = public`

Mitiga hijacking de funciones por manipulación de `search_path` del caller.

```sql
create or replace function public.rpc_name(...)
returns ...
language plpgsql
security definer
set search_path = public  -- OBLIGATORIO
as $$
begin
  ...
end;
$$;
```

Si heredas una función sin esto:

```sql
alter function public.rpc_name(...) set search_path = public;
```

### 2. Llamar `check_membership()` como primera línea

Nunca se confía en el caller. La primera instrucción del cuerpo:

```sql
begin
  perform public.check_membership(
    auth.uid(),
    p_hotel_id,
    array['admin','direction','superadmin']::public.app_role[]
  );
  -- resto de la lógica
end;
```

### 3. Validar inputs text contra whitelists

Cuando un argumento es `text` y hay un conjunto finito de valores válidos, validar al inicio:

```sql
if p_sync_type not in ('sync_occupancy','sync_reservations','test_connection') then
  raise exception 'Invalid sync_type: %', p_sync_type using errcode = 'P0003';
end if;
```

Patrón establecido en migración `00029_sync_type_and_config_validation`.

### 4. REVOKE/GRANT para funciones service-only

Si la función la invoca un worker (Edge Function con service_role), no un usuario:

```sql
revoke execute on function public.rpc_name(...) from public, anon, authenticated;
grant execute on function public.rpc_name(...) to service_role;
```

Aplicado en migración `00024_security_fixes` para worker RPCs.

---

## Edge Functions con `SUPABASE_SERVICE_ROLE_KEY`

Las Edge Functions que usan el service role deben validar el `Authorization` header **antes** de crear el cliente Supabase.

```typescript
const authHeader = req.headers.get('Authorization')
const expectedToken = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`
if (!authHeader || authHeader !== expectedToken) {
  return new Response('Unauthorized', { status: 401 })
}
// solo aquí creamos el cliente con service role
const supabase = createClient(url, serviceRoleKey)
```

### Webhooks con payload del cliente

Si la Edge Function procesa un webhook cuyo payload viene del cliente, **NO confiar en el contenido del payload** para operaciones sensibles. Leer la fuente de verdad desde DB usando solo el `id` del payload:

```typescript
const { record_id } = await req.json()
// NO: operar directamente con los campos del payload
// SÍ: leer la fila completa desde DB y usar esos datos
const { data: record } = await supabase
  .from('notifications')
  .select('*')
  .eq('id', record_id)
  .single()
```

Patrón establecido en `notification-dispatcher` post-commit `0ed3c16`.

---

## Rate limits

Toda Edge Function sensible debe consumir `consume_rate_limit()` al inicio:

```typescript
const { allowed, remaining, reset_at } = await supabase.rpc('consume_rate_limit', {
  p_key: `ocr:${hotel_id}`,
  p_max: 30,
  p_window_seconds: 3600,
})
if (!allowed) {
  return new Response('Rate limit exceeded', { status: 429, headers: { 'Retry-After': ... } })
}
```

La función `consume_rate_limit` es atómica (`SELECT FOR UPDATE`), fail-open si la BD cae, y es service-only.

---

## Idempotencia

Las operaciones que deben ser idempotentes usan:

- Hash SHA-256 del input (cliente-side con `crypto.subtle.digest`) → path + column
- `unique index parcial` en `(hotel_id, input_hash)`
- Early check en RPC / Edge Function: si hash ya existe, devolver resultado anterior sin reprocessar

Patrón establecido en OCR albaranes (`00044_ocr_idempotency`) y jobs queue (`00043_idempotency_infrastructure`).

---

## Patrones por tipo de policy

### Tabla tenant-local, todos los miembros leen metadata

```sql
create policy "tabla_select" on public.tabla
  for select using (public.is_member_of(hotel_id));
```

### Tabla con datos sensibles (credentials, payloads, etc.)

```sql
create policy "tabla_select_admin" on public.tabla
  for select using (
    public.get_member_role(hotel_id) in ('superadmin','direction','admin')
  );
```

### Writes siempre por rol (no solo membership)

```sql
create policy "tabla_insert" on public.tabla
  for insert with check (
    public.get_member_role(hotel_id) in ('superadmin','direction','admin')
  );
```

### Solo insertable/updateable vía SECURITY DEFINER RPCs

```sql
create policy "tabla_insert_rpc_only" on public.tabla
  for insert with check (false);
create policy "tabla_update_rpc_only" on public.tabla
  for update using (false);
```

Patrón usado en `integration_sync_logs` (migración `00032_fix_m12_sync_logs`).

---

## Domain events

El emisor de domain events es la RPC `emit_event(...)` definida en migración de foundation. Tiene dedup de ventana (default 5s) para evitar duplicados por triggers disparados 2×.

Post-hardening (`00047_fix_emit_event_grant`): `REVOKE EXECUTE FROM public, anon, authenticated` + `GRANT TO service_role`.

El emisor dentro de triggers (que corren con el rol del caller) funciona porque los triggers se ejecutan con `SECURITY DEFINER` en su contexto y pueden invocar funciones restringidas.

---

## Errores y codes

Códigos custom usados en RPCs:

- `P0001` — acceso denegado (membership check fallida)
- `P0003` — validación de whitelist fallida (sync_type, estado inválido)
- `P0016` — idempotencia (operación ya ejecutada, estado terminal)

---

## Referencias a migraciones v2

El proyecto Supabase compartido con v2 ya tiene aplicadas las migraciones de hardening:

- `00001_d0_identity` — definición de `check_membership`, `is_member_of`, `get_member_role`
- `00024_security_fixes` — patrón REVOKE/GRANT worker RPCs
- `00028_security_hardening` — Codex audit round 1 (credentials, sync role check, search_path M15)
- `00029_sync_type_and_config_validation` — Codex audit round 2 (whitelist sync_type)
- `00030_security_audit_fixes` — round 3 (IDOR create_hotel, triggers state-machine guards)
- `00033_fix_notifications_rls` — round 4 (is_member_of en notifications)
- `00034_security_audit_round4` — round 4 adversarial
- `00042_rate_limit_infrastructure` — rate limits atómicos
- `00043_idempotency_infrastructure` — cache idempotencia
- `00044_ocr_idempotency` — hash pre-upload
- `00045_po_idempotency` — SELECT FOR UPDATE en PRs
- `00046_domain_events_dedup` — ventana 5s en emit_event
- `00047_fix_emit_event_grant` — REVOKE/GRANT emit_event
- `00048_fix_add_kitchen_order_item` — tenant scope en UPDATE
- `00049_fix_internal_rpcs_grants` — service-only grants
- `00050_fix_event_client_hotel_scope` — cross-tenant client leak
- `00051_security_rpc_tenant_scope` — seed_default + get_production + receive_goods
- `00052_fix_calculate_event_cost_scope` — restringir mutación events.theoretical_cost

Estas migraciones forman la base de seguridad heredada. Toda RPC nueva debe cumplir el checklist.

---

## Auditoría pre-commit

Checklist para cambios en DB:

- [ ] ¿Tabla nueva con `hotel_id uuid not null`?
- [ ] ¿RLS habilitada en la tabla nueva?
- [ ] ¿Policies cubren SELECT + writes separadamente?
- [ ] ¿Si hay credentials/payloads sensibles, el SELECT restringe a admin+?
- [ ] ¿RPC nueva tiene `SET search_path = public`?
- [ ] ¿RPC nueva llama `check_membership()` como primera línea?
- [ ] ¿Inputs text validados contra whitelist?
- [ ] ¿Si es service-only, hay REVOKE/GRANT explícito?
- [ ] ¿Edge Function valida `Authorization` antes de crear cliente service_role?
- [ ] ¿Rate limit aplicado si la función es costosa?
- [ ] ¿Idempotencia aplicada si la operación debe ser idempotente?
- [ ] ¿Tests de denegación cubren cross-tenant y role insuficiente?

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/core-constraints.md`
- `/.ai/specs/permissions-matrix.md`
- `/.ai/specs/domain-events.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/checklists/migration-checklist.md`

---

## Estado de esta especificación

Este documento define las reglas de seguridad de base de datos de ChefOS v3.

Toda RPC, policy, Edge Function y migración debe cumplirlas.
