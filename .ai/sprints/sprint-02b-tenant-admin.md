# ChefOS v3 Sprint 02b - Tenant Admin

## Objetivo del sprint

Construir el módulo `tenant-admin` con alcance completo: onboarding (crear tenant + primer hotel + admin membership), gestión de hoteles adicionales bajo el mismo tenant, team management (listar/mutar rol/desactivar miembros), e invitaciones por email con token.

Este sprint cierra el pendiente anticipado por **ADR-0007** y añade oficialmente `tenant-admin` como 15º módulo del sistema (ADR-0009).

---

## Estado del sprint

- Módulo principal: `tenant-admin` (nuevo, registrado en ADR-0009)
- Tipo: funcional + migración SQL + integración externa (Resend)
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity` (consume contratos públicos)
  - `sprint-02-commercial` (sprint hermano, no afecta)
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `tenant-admin`

Owner de:

- Crear y listar `tenants`
- Crear y listar `hotels` (bajo un tenant existente)
- Mutar `memberships` (cambiar rol, activar/desactivar)
- Emitir/aceptar/revocar `invites` email+token

NO es owner de:

- Sesión y auth flow → `identity`
- Consulta de "hotel activo del user actual" → `identity`
- Roles enum → `identity`

---

## Alcance

### Incluye

- RPC `create_tenant_with_hotel` (ya existe en v2, se consume)
- RPC `create_hotel` (ya existe en v2, se consume)
- Tabla `invites` + 3 RPCs nuevas (`create_invite`, `accept_invite`, `revoke_invite`) → migración `00053_sprint02b_invites.sql`
- Integración Resend para envío de emails de invitación
- UI: onboarding form, lista de hoteles, lista de miembros, lista de invites, modal invitar, página accept-invite
- Rutas: `(onboard)/onboarding`, `(app)/settings/hotels`, `(app)/settings/team`, `/invite/[token]`
- Modificar `(app)/layout.tsx` para redirigir a `/onboarding` en vez de `/no-access` cuando no hay activeHotel
- E2E: onboarding flow + invite flow

### No incluye

- Bulk invite desde CSV
- Reenvío automático de invites expirados
- Transfer ownership entre tenants
- Billing / plan limits
- UI de audit log (queda como `domain_events` tabla, sin UI)
- Notificaciones in-app de invitación (sprint-11)

---

## Entidades de dominio

```ts
type Invite = {
  id: string
  hotel_id: string
  tenant_id: string
  email: string                 // lowercased
  role: Role
  expires_at: string
  created_by: string
  created_at: string
  accepted_at: string | null
  accepted_by: string | null
  revoked_at: string | null
}

type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

type TeamMember = {
  membership_id: string
  user_id: string
  email: string
  full_name: string | null
  role: Role
  is_active: boolean
  joined_at: string
}
```

## State machine invites

```
pending ──acceptado──→ accepted  (terminal)
   │
   ├──revoked───────→ revoked    (terminal)
   │
   └──expira───────→ expired     (terminal; no hay row update — se derivadamente del expires_at)
```

## Contratos públicos (`src/features/tenant-admin/index.ts`)

**Types**: `Invite, InviteStatus, TeamMember, TenantWithHotelInput, CreateHotelInput, CreateInviteInput`.

**Errors**: `InviteNotFoundError, InviteExpiredError, InviteAlreadyAcceptedError, InviteRevokedError, InviteEmailMismatchError, TenantAlreadyExistsError`.

**Invariants**: `isInviteExpired(invite)`, `isInviteAcceptable(invite, user)`, `computeInviteStatus(invite)`, `INVITE_STATUS_LABELS`.

**Hooks client**: `useTenantHotels, useCreateTenantWithHotel, useCreateHotel, useTeamMembers, useUpdateMemberRole, useDeactivateMember, useInvites, useCreateInvite, useRevokeInvite`.

**Server helpers (server.ts)**: `getInviteByToken(token)`, `acceptInvite(token)`.

## Casos de uso (`application/`)

- `use-create-tenant-with-hotel.ts` — onboarding
- `use-create-hotel.ts` — añadir hotel
- `use-tenant-hotels.ts` — listar hoteles del tenant
- `use-team-members.ts` — listar miembros
- `use-update-member-role.ts`, `use-deactivate-member.ts`
- `use-invites.ts` — listar invites pendientes
- `use-create-invite.ts`, `use-revoke-invite.ts`
- Server: `get-invite-by-token.server.ts`, `accept-invite.server.ts`

## RPCs consumidas

**Existentes en v2 (consume):**
- `create_tenant_with_hotel(p_tenant_name, p_hotel_name, p_hotel_slug, p_timezone, p_currency) → jsonb {tenant_id, hotel_id}`
- `create_hotel(p_tenant_id, p_hotel_name, p_hotel_slug, p_timezone, p_currency) → uuid` (si existe; si no, select directo)

**Nuevas (sprint-02b):**
- `create_invite(p_hotel_id, p_email, p_role) → jsonb {invite_id, token, email, expires_at}` — SECURITY DEFINER con `check_membership` admin/direction/superadmin en primera línea.
- `accept_invite(p_token) → jsonb {hotel_id, tenant_id, role}` — SECURITY DEFINER. **Excepción ADR-0009**: no lleva `check_membership` (el user aún no es miembro). Valida: auth.uid + token_hash + expiración + email match.
- `revoke_invite(p_invite_id) → void` — SECURITY DEFINER con `check_membership` admin/direction/superadmin.

## Eventos de dominio

Emite:
- `tenant.created` (al completar onboarding)
- `hotel.created` (al crear hotel adicional)
- `member.invited` (create_invite)
- `member.accepted` (accept_invite)
- `member.invite_revoked` (revoke_invite)
- `member.role_updated` (update_member_role si se usa RPC; si es UPDATE directo, skipear)
- `member.deactivated`

## Tests mínimos

**Unit (domain):**
- `isInviteExpired` (expires_at pasado/futuro)
- `isInviteAcceptable` (4 estados terminales + email match)
- `computeInviteStatus` (cubre todos los casos derivados)
- `INVITE_STATUS_LABELS` cubre todos los estados

**E2E:**
- `onboarding.spec.ts` — user sin hotel activo → /onboarding → rellena form → redirect dashboard (env-aware; skipea si signups OFF).
- `invite-flow.spec.ts` (parcial) — admin crea invite → recibe token en respuesta → visita /invite/[token] con otro user logueado → aceptación OK.
- `invite-revoke.spec.ts` — crear + revocar + intentar aceptar → error.

## Criterios de done específicos

- Migración 00053 aplicada sin romper v2 (verificar con SELECT simple).
- Token plano JAMÁS persiste (solo en response RPC y URL email).
- Email se envía real con `RESEND_API_KEY` presente, skippea limpio sin ella (log warning, devuelve link para copy-paste dev).
- Accept con email mismatched devuelve `InviteEmailMismatchError` (no 500).
- `(app)/layout.tsx` redirige a `/onboarding` (no `/no-access`) cuando no hay activeHotel.
- Onboarding crea tenant+hotel+membership admin atómicamente (RPC v2 asegura atomicidad).
- Team management respeta permisos: solo admin/direction/superadmin pueden mutar.
- typecheck + lint + test + build + e2e todos verdes.

## Referencias cruzadas

- `.ai/specs/decisions-log.md § ADR-0009` — arquitectura detallada
- `.ai/specs/module-list.md` — tenant-admin como 15º módulo
- `.ai/specs/core-constraints.md § 3.c` — excepción accept_invite
- `.ai/sprints/sprint-01-identity.md` — dependencia (consume identity)
- `supabase/migrations/00053_sprint02b_invites.sql` — migración crítica

## Estado de este documento

Sprint 02b del módulo `tenant-admin`. Arranca 2026-04-22.
