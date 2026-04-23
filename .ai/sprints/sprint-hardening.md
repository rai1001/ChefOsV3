# ChefOS v3 Sprint Hardening — Mitigación de auditorías Codex + Antigravity

## Objetivo del sprint

Cerrar los hallazgos confirmados de las dos auditorías externas (Codex y Antigravity) sobre el estado del repo tras `sprint-03b-menus`. El sprint NO añade features de negocio: endurece la superficie pública (auth, rate limit, headers), unifica el manejo de errores y paginación, e introduce dos quick wins (ESLint boundaries + tipos Supabase autogenerados).

Israel pidió cerrar AMBAS auditorías antes de seguir con `sprint-03c-import-excel` o `sprint-04-catalog`.

---

## Estado del sprint

- Tipo: sprint transversal (no es un módulo nuevo).
- ADRs nuevos: **ADR-0011** (rate-limit + headers + origin allowlist), **ADR-0012** (codegen tipos Supabase).
- Dependencias: todos los sprints previos (toca código de identity, commercial, recipes, menus, tenant-admin).
- Riesgo: medio — toca middleware global y queries de todos los módulos. Mitigado por orden de ejecución incremental + tests cross-tenant.

---

## Hallazgos cubiertos

### Codex (P0)

| ID       | Resumen                                                                                        | Estado  |
| -------- | ---------------------------------------------------------------------------------------------- | ------- |
| SEC-001  | `error.message` crudo de Supabase expuesto al cliente en login/forgot-password                 | abordar |
| SEC-002  | Sin rate limit en login, forgot-password, accept-invite                                        | abordar |
| PERF-001 | `select('*')` sin `limit/range` en queries de lista (commercial, recipes, menus, tenant-admin) | abordar |

### Codex (P1)

| ID       | Resumen                                                                                               | Estado  |
| -------- | ----------------------------------------------------------------------------------------------------- | ------- |
| ARC-001  | `commercial/server.ts` vacío (`export {}`). Páginas server tiran de hooks client                      | abordar |
| SEC-003  | `createInviteAction` construye `origin` desde headers `host`/`x-forwarded-proto` sin allowlist        | abordar |
| SEC-004  | `next.config.ts` sin CSP/HSTS/X-Frame-Options/Referrer-Policy/Permissions-Policy                      | abordar |
| PERF-002 | `queryClient.invalidateQueries()` global en switch de hotel                                           | abordar |
| API-001  | Errores heterogéneos: invites mapea a clases de dominio, eventos/clientes lanzan error Supabase crudo | abordar |

### Antigravity

| ID            | Resumen                                                    | Estado  |
| ------------- | ---------------------------------------------------------- | ------- |
| ANTIGR-SEC-01 | Sin tests E2E de aislamiento cross-hotel                   | abordar |
| ANTIGR-QW1    | ESLint sin boundaries entre módulos                        | abordar |
| ANTIGR-QW2    | Sin script `supabase gen types` ni `src/types/database.ts` | abordar |

### Codex (P2)

| ID      | Resumen                                                                | Estado                               |
| ------- | ---------------------------------------------------------------------- | ------------------------------------ |
| ARC-002 | README/CHANGELOG desalineados con sprints cerrados (incluyendo 03/03b) | abordar                              |
| UX-001  | Listas sin paginación UI                                               | abordar (mínimo: botón "Cargar más") |

### Fuera de scope

- **DB-001 (Codex)**: auditoría completa de migraciones por bounded context. Es revisión documental, no implementación. → sprint propio futuro.
- **OPS-001 (Codex)**: observability + alertado + DR runbook. → sprint propio futuro.
- **ID-DB-01 (Antigravity P3)**: mover RPCs masivos PL/pgSQL a Node. → cambio masivo, requiere análisis caso por caso.
- **Falsos positivos Antigravity**: ARQ-01 (`index.ts` ya existen) y ARQ-02 (capa `infrastructure/` ya separa Supabase de hooks). Verificado contra código.

---

## Alcance

### Incluye

- **Catálogo errores auth** — `src/features/identity/domain/auth-errors.ts` con códigos finitos. Mensajes neutros + log con correlation id.
- **Catálogo errores transversal** — `src/lib/errors/index.ts` con `AppError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`. `src/lib/errors/map-supabase-error.ts` mapea `PostgresError` y `AuthError` a la jerarquía.
- **Rate limiting Upstash** — `src/lib/rate-limit/index.ts`. Middleware en `src/proxy.ts` aplica límites a `/login`, `/forgot-password`, `/accept-invite`. Modo skip si vars vacías.
- **Origin allowlist** — `src/lib/app-url/index.ts`. `getCanonicalAppUrl()` lee de `process.env.NEXT_PUBLIC_APP_URL` validado contra `APP_URL_ALLOWLIST`. Refactor `create-invite-action.ts`.
- **Headers HTTP** — `next.config.ts` con `async headers()`. CSP nonce, HSTS, X-Frame, X-Content-Type, Referrer, Permissions.
- **Paginación queries** — refactor de `infrastructure/*-queries.ts` en commercial, recipes, menus, tenant-admin. Contrato `{ pageSize?: number, cursor?: string }` → `{ rows: T[], nextCursor: string | null }`. Default 50, max 200.
- **Server contracts** — `commercial/server.ts`, `recipes/server.ts` (extender), `menus/server.ts` (extender) exponen helpers `getXServer/getXsServer`. Páginas server migran imports.
- **Invalidación scoped** — `use-switch-hotel.ts` invalida solo claves prefijadas con el hotelId saliente.
- **Tests cross-tenant** — `e2e/tests/tenant-isolation.spec.ts` cubre events, event_spaces, clients, invites, recipes, menus.
- **Tests rate-limit** — `e2e/tests/auth-rate-limit.spec.ts` (login spam → 429).
- **ESLint boundaries** — `eslint-plugin-boundaries` o `no-restricted-imports` que prohíbe importar `@/features/X/{domain,application,infrastructure,components}` desde fuera de `X`.
- **Tipos Supabase autogenerados** — script `db:types`, `src/types/database.ts`, primer pase de adopción en `infrastructure/*-queries.ts` de commercial.
- **README/CHANGELOG** — capability matrix con fecha, sprints cerrados, módulos productivos.
- **UI paginación** — botón "Cargar más" en tablas de eventos/clientes/recipes/menus.

### No incluye

- Renumeración de migraciones SQL.
- Mover lógica RPC compleja a Node.
- Observability (Sentry, OpenTelemetry).
- Backups + DR runbook.
- Virtualización de tablas (windowing).
- Generación masiva de fixtures multi-hotel para tests cross-tenant (se hace mínimo: 2 hoteles seed).

---

## Archivos afectados

### Crear

```
src/features/identity/domain/auth-errors.ts
src/lib/errors/index.ts
src/lib/errors/map-supabase-error.ts
src/lib/rate-limit/index.ts
src/lib/app-url/index.ts
src/types/database.ts                       # autogenerado
e2e/tests/tenant-isolation.spec.ts
e2e/tests/auth-rate-limit.spec.ts
```

### Modificar

```
src/app/(auth)/login/actions.ts
src/app/(auth)/forgot-password/actions.ts
src/app/(auth)/signup/actions.ts            # mismo patrón error mapping
src/features/identity/application/use-switch-hotel.ts
src/features/tenant-admin/application/create-invite-action.ts
src/features/commercial/server.ts
src/features/commercial/infrastructure/event-queries.ts
src/features/commercial/infrastructure/client-queries.ts
src/features/commercial/infrastructure/beo-queries.ts
src/features/recipes/server.ts
src/features/recipes/infrastructure/recipe-queries.ts
src/features/recipes/infrastructure/ingredient-queries.ts
src/features/recipes/infrastructure/step-queries.ts
src/features/recipes/infrastructure/sub-recipe-queries.ts
src/features/recipes/infrastructure/escandallo-queries.ts
src/features/menus/server.ts
src/features/menus/infrastructure/menu-queries.ts
src/features/menus/infrastructure/section-queries.ts
src/features/tenant-admin/infrastructure/invite-queries.ts
src/features/tenant-admin/infrastructure/tenant-queries.ts
src/features/tenant-admin/infrastructure/team-queries.ts
src/features/identity/infrastructure/identity-queries.ts
src/app/(app)/events/page.tsx
src/app/(app)/clients/page.tsx
src/app/(app)/recipes/page.tsx
src/app/(app)/menus/page.tsx
src/proxy.ts
next.config.ts
eslint.config.mjs
package.json                                # add @upstash/{ratelimit,redis} + script db:types
.env.example                                # add UPSTASH_* vars
README.md
CHANGELOG.md
.ai/specs/decisions-log.md                  # ADR-0011, ADR-0012 (ya añadidos)
```

---

## Orden de ejecución (commits atómicos)

1. **chore(specs)**: ADR-0011 + ADR-0012 + spec del sprint. (este commit)
2. **feat(errors)**: catálogo `src/lib/errors` + `mapSupabaseError`.
3. **feat(identity)**: catálogo `auth-errors` + refactor login/signup/forgot-password actions.
4. **feat(commercial)**: paginación cursor en event-queries y client-queries + adopt mapSupabaseError.
5. **feat(recipes)**: paginación cursor en recipe-queries + adopt mapSupabaseError.
6. **feat(menus)**: paginación cursor en menu-queries y section-queries + adopt mapSupabaseError.
7. **feat(tenant-admin)**: paginación + adopt mapSupabaseError en invite/tenant/team queries.
8. **feat(rate-limit)**: `src/lib/rate-limit` + middleware en `src/proxy.ts`.
9. **feat(app-url)**: `src/lib/app-url` + refactor `createInviteAction` para usar canonical URL.
10. **feat(server-contracts)**: `commercial/server.ts` getXServer + recipes/menus extensión + migración de páginas.
11. **feat(security)**: headers HTTP en `next.config.ts`.
12. **fix(identity)**: invalidación scoped en `use-switch-hotel`.
13. **test(e2e)**: tenant-isolation.spec.ts + auth-rate-limit.spec.ts.
14. **chore(eslint)**: boundaries.
15. **chore(types)**: script `db:types` + commit inicial de `src/types/database.ts`.
16. **chore(ui)**: paginación tablas.
17. **docs**: README + CHANGELOG + capability matrix.

---

## Verificación pre-PR

- `pnpm lint` — 0 warnings.
- `pnpm typecheck` — 0 errores.
- `pnpm test` — todo verde, coverage ≥90% en `domain/` y `application/`.
- `pnpm test:e2e` — incluye nuevos specs.
- Manual smoke:
  - 6 logins fallidos seguidos → 429.
  - DevTools Network: headers CSP + HSTS visibles.
  - `curl -H "Host: evil.com" http://localhost:3000/...` invitación → URL devuelta apunta al dominio canónico.
  - Switch de hotel → React Query Devtools muestra invalidación solo de keys del hotel saliente.
  - `pnpm db:types` → `src/types/database.ts` regenerado sin diff inesperado.
  - Importar `@/features/recipes/domain/types` desde `commercial/` → ESLint error.
- PR único `feature/sprint-hardening` → main, etiquetar con `hardening` y `security`.

---

## Estado de esta especificación

Sprint en ejecución. Cierre cuando los 17 commits del orden estén pusheados, todos los checks verdes y la auditoría manual completada.
