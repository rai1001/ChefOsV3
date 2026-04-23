# ChefOS v3 Core Constraints

## Objetivo

Este documento define las reglas duras no negociables del sistema ChefOS v3. Son constraints que **todo** código, módulo, migración y decisión debe respetar.

Su propósito es evitar:

- violaciones de multi-tenancy
- acceso sin autorización a datos sensibles
- acoplamientos laterales entre módulos
- lógica de negocio fuera de su capa
- dependencias arbitrarias entre módulos

Este documento es normativo y sus reglas son **no negociables**.

---

## Principios

1. Multi-tenant por `hotel_id` es obligatorio en toda tabla de negocio.
2. RLS activa siempre en tablas sensibles.
3. Los módulos no se llaman entre sí: emiten eventos.
4. La UI no accede a datos directamente.
5. Los tests cubren permisos y tenancy cuando aplican.
6. Ninguna regla dura se rompe sin ADR explícita.

---

## Reglas duras

### 1. Multi-tenant obligatorio

- Toda tabla de negocio incluye `hotel_id uuid not null`.
- Toda query filtra por `hotel_id` (directamente o vía RLS).
- RLS impide lecturas y escrituras cruzadas entre hoteles.
- Los seeds y scripts de datos respetan aislamiento por `hotel_id`.

**Violación**: crear una tabla de negocio sin `hotel_id` o consultar sin filtrar por él.

---

### 2. Roles base del sistema

Los roles oficiales son:

- `superadmin` — cross-tenant, solo para operaciones de soporte
- `direction` — dirección del grupo hotelero
- `admin` — admin del hotel, gestiona usuarios y configuración
- `head_chef` — jefe de cocina, con capacidad de aprobar compras
- `sous_chef` — segundo chef
- `cook` — cocinero operativo
- `commercial` — comercial / recepción que vende eventos
- `procurement` — compras
- `warehouse` — almacén / recepción de mercancía
- `room` — sala / servicio
- `reception` — recepción
- `operations` — operaciones generales
- `maintenance` — mantenimiento

Agrupación por perfil UX (ver `features/identity/domain/types.ts`): `cocina`, `oficina`, `compras`, `comercial`.

**Violación**: introducir un rol nuevo sin ADR y sin actualizar `permissions-matrix.md`.

---

### 3. RLS activa en tablas sensibles

- Tablas con datos de negocio tienen RLS habilitada.
- Tablas con credentials, tokens, API keys o payloads de terceros siguen la política de credentials (ver `database-security.md`).
- Las políticas RLS usan helpers canónicos: `is_member_of()`, `get_member_role()`, `check_membership()`.

**Violación**: crear tabla sensible sin RLS habilitada o con policies que permiten lectura cruzada.

> **Excepción documentada (ADR-0009):** `accept_invite(p_token)` en `tenant-admin` es SECURITY DEFINER pero NO lleva `check_membership()` como primera línea — el caller todavía no es miembro del hotel destino. Valida equivalentemente: `auth.uid()` + `token_hash` match + expiración + email case-insensitive match con `auth.users.email`. Ver `specs/decisions-log.md § ADR-0009`.

---

### 4. Storage por `hotel_id` en la ruta

Toda la ruta de objetos en Supabase Storage empieza por `<hotel_id>/...`. Los buckets tienen políticas que validan el segmento inicial de la ruta contra `is_member_of(hotel_id)`.

Ejemplo:

- `delivery-notes/11111111-.../2026-04-21-<hash>.jpg` ✅
- `delivery-notes/2026-04-21-<hash>.jpg` ❌ (sin hotel_id)

**Violación**: escribir objetos fuera del prefijo `<hotel_id>/`.

---

### 5. Edge Functions para operaciones privilegiadas

Las siguientes operaciones solo ocurren en Edge Functions (nunca desde cliente):

- Generación de PDFs (BEO, etiquetas APPCC, albaranes)
- Dispatcher de notificaciones (email, push)
- Worker de automatizaciones (jobs queue)
- OCR de albaranes
- Sync con integraciones PMS/POS

Las Edge Functions validan `Authorization: Bearer <service_role>` antes de actuar (ver `database-security.md`).

**Violación**: intentar estas operaciones desde el cliente o desde una API route sin validación de service role.

---

### 6. Arquitectura de capas (resumen)

- `src/app/` — routing, layouts, composición. Cero lógica de negocio.
- `src/features/<module>/domain/` — entidades, invariantes, reglas puras.
- `src/features/<module>/application/` — casos de uso, orquestación.
- `src/features/<module>/infrastructure/` — adapters Supabase, integraciones externas.
- `src/features/<module>/index.ts` — contrato público del módulo.
- `src/lib/` — concerns compartidos (auth helpers, errors, utils). No dominio.
- `src/components/` — UI reutilizable sin dominio.
- `supabase/` — migraciones, RPCs, Edge Functions, seeds.

**Violación**: lógica de negocio en `src/app/` o `src/components/`, acceso directo a `src/lib/supabase` desde componentes, importar internals de otro módulo.

---

### 7. Módulos no se llaman entre sí

- Los módulos emiten `domain_events` (ver `domain-events.md`).
- Otros módulos reaccionan a eventos vía triggers o workers.
- No hay `import { something } from '@/features/<otroMódulo>/domain/...'` — solo se consume el contrato público vía `@/features/<module>`.

**Violación**: importar internals (`domain/`, `application/`, `infrastructure/`) de otro módulo.

---

### 8. UI no accede a datos directamente

- La UI consume hooks de `application/` de su módulo o de contratos públicos de otros módulos.
- No hay `.from('tabla').select(...)` en componentes.
- No hay `supabase.rpc(...)` en componentes.
- Los hooks viven en `application/` y encapsulan el acceso.

**Violación**: usar el cliente Supabase dentro de componentes UI.

---

### 9. Tests obligatorios para permisos y tenancy

Todo cambio que toque:

- RLS
- RPCs con `check_membership`
- Edge Functions con validación de role
- endpoints que dependan de `hotel_id`

requiere test que valide:

- el acceso autorizado funciona
- el acceso no autorizado es rechazado
- el cross-tenant es rechazado

Ver `testing-standards.md` para detalles.

**Violación**: cerrar cambio que toca permisos sin test de denegación.

---

### 10. Prohibiciones específicas

- **Prohibido** `// @ts-ignore` sin comentario explicativo y ADR si afecta contrato público.
- **Prohibido** `any` como escape. Si se necesita, justificar con comentario.
- **Prohibido** acceso directo a Supabase desde componentes (usar application/adapters).
- **Prohibido** añadir librerías UI nuevas sin ADR (ver `decisions-log.md` ADR-0002).
- **Prohibido** saltarse tests/coverage.
- **Prohibido** commits con `--no-verify` salvo hotfix documentado.

---

## Señales de violación en code review

- importar de `src/features/<módulo>/domain/` desde otro módulo
- `supabase.from(...)` en `src/components/` o `src/app/`
- tabla nueva sin `hotel_id`
- RPC nueva sin `check_membership` en primera línea
- columna sensible sin política admin-only
- test ausente para cambio en permisos
- librería UI añadida sin ADR

---

## Cómo manejar excepciones

Si una tarea parece requerir violar una regla dura:

1. No violarla.
2. Registrar la situación en `decisions-log.md` como propuesta.
3. Consultar al usuario.
4. Si se aprueba excepción, registrarla como ADR aceptada con mitigation plan.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/architecture.md`
- `/.ai/specs/database-security.md`
- `/.ai/specs/permissions-matrix.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/domain-events.md`
- `/.ai/specs/decisions-log.md`

---

## Estado de esta especificación

Este documento define las reglas duras de ChefOS v3.

Toda violación identificada en revisión bloquea el merge hasta resolución.
