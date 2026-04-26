# Changelog

Todos los cambios notables del proyecto se documentan aquí. Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado: [SemVer](https://semver.org/lang/es/).

## [0.5.2] - 2026-04-26

### Sprint-05c — Procurement OCR pipeline

### Added

- Migraciones `00068`-`00070`: bucket `v3-procurement-uploads`, tabla `v3_procurement_ocr_jobs`, enum `v3_ocr_job_status` y RPCs OCR create/extract/fail/review/apply/reject.
- Edge Function `v3-procurement-ocr-extract` con JWT, membership, Claude Vision, JSON estricto y rate limit Upstash 10/hotel/hora.
- Capa TS OCR en `src/features/procurement`: schemas, errores, queries/RPC wrappers, storage helper y hooks TanStack Query.
- UI OCR: upload, cola de revisión y detalle editable con preview PDF/imagen.
- Tests unit de OCR y spec Playwright `e2e/tests/procurement-ocr-flow.spec.ts` gated por `OCR_E2E_LIVE=1`.

### Changed

- Procurement queda en estado PR/PO/GR/OCR parcial con revisión humana; inventory sigue para sprint-06.
- README documenta ejecución local de la Edge Function.

### Pending Ops

- Aplicar migraciones `00068`-`00070` via WALL-E/MCP y regenerar `src/types/database.ts`.
- Desplegar Edge Function y configurar `ANTHROPIC_API_KEY` + Upstash env vars.

## [0.5.1] - 2026-04-26

### Sprint-05b — Procurement Goods Receipts + cierre deuda escandallo

### Added

- Migraciones `00064` y `00065`: `v3_goods_receipts`, `v3_goods_receipt_lines`, enum `v3_gr_quality_status` y RPC `v3_receive_goods` con locks, control de cantidades pendientes, eventos de dominio y `v3_price_change_log`.
- UI de recepción: detalle de PO, formulario `/procurement/purchase-orders/[id]/receive`, listado `/procurement/goods-receipts` y detalle de recepción.
- Capa TS GR en `src/features/procurement`: tipos, schemas, invariants, queries, RPC wrapper y hooks TanStack Query.
- E2E `e2e/tests/procurement-receive-flow.spec.ts` para parcial, completar, sobre-recepción, rechazo y cross-tenant.

### Fixed

- Migración `00066`: `v3_get_escandallo_live` y `v3_sync_escandallo_prices` dejan de leer tablas v2 de compras y pasan a `v3_goods_receipts`/`v3_purchase_orders`.
- Migración `00067`: restaurada FK `v3_supplier_incidents.purchase_order_id` contra `v3_purchase_orders(hotel_id, id)`.
- `procurement/domain/errors.ts` alineado con las subclases `AppError` introducidas por PR #62.

### Verification

- `npm test -- --run` — 364 tests verdes.
- `npm run typecheck` — verde.
- `npm run lint` — verde.
- Playwright específico creado; en esta sesión quedó `skipped` hasta aplicar las migraciones GR en Supabase remoto.

### Pendiente

- OCR Edge Function, upload/deduplicación de albaranes y cascada automática cross-recipe → sprint-05c.

## [0.5.0] - 2026-04-22

### Sprint-03c — Módulo `import` (17º oficial) + import Excel de recetas

Cierra el pain comercial #1 ("todo el mundo tiene las recetas en Excel"). Permite migrar
200 recetas en <10 min. Owner transversal de migración bulk: futuros sprints
(catalog, inventory) reusarán esta infraestructura.

### ADRs

- **ADR-0013** — Módulo `import` separado + arquitectura híbrida (parse client +
  validate server + RPC bulk). exceljs (MIT). Atomicidad parcial. Mapping
  product_id/unit_id NULL hasta sprint-04-catalog.

### Added

- **Migración `00054_sprint03c_import.sql`**:
  - Enum `import_kind` (`recipes`; futuro: `products`, `inventory`).
  - Enum `import_status` (`pending`, `running`, `completed`, `partial`, `failed`).
  - Tabla `import_runs` con RLS admin/direction/superadmin.
  - RPC `import_recipes_bulk(p_hotel_id, p_payload jsonb) → jsonb` SECURITY DEFINER.
    Atomicidad por fila (savepoint), FK por nombre case-insensitive,
    devuelve `{ run_id, ok_count, failed_count, failed[] }`.
- **Módulo `src/features/import/`** (17º oficial):
  - `domain/types.ts`: ImportKind, ImportStatus, ImportRun, ImportFailure,
    ImportResult, ParsedRecipeRow, ParsedIngredientRow, ParsedRecipesPayload,
    ValidationReport.
  - `domain/errors.ts`: ExcelParseError, MissingSheetError, EmptyImportError,
    ImportRunNotFoundError.
  - `domain/invariants.ts`: normalizeRecipeName, parseCsvField, cellToNumber
    (acepta coma decimal europea), cellToString, findOrphanIngredientRecipes.
  - `application/parse-excel.ts`: parser exceljs dynamic import. Headers
    case-insensitive sin acentos con aliases. Skip filas vacías.
  - `application/schemas.ts`: Zod parsedRecipeRowSchema, parsedIngredientRowSchema.
  - `application/validate-payload.ts`: cross-validation FK + duplicate detection.
  - `application/use-import-recipes.ts`, `use-import-runs.ts`.
  - `infrastructure/import-queries.ts`: importRecipesBulk + fetchImportRuns paginada.
  - `components/`: import-recipes-form (state machine), import-preview-table,
    import-result-summary (descarga CSV errores), template-download-button.
- **Ruta `/recipes/import`** + CTA "Importar desde Excel" en `/recipes`.
- **Endpoint `/api/import/template/recipes`** — genera xlsx runtime con headers
  marcados, 1 receta de ejemplo, 2 ingredientes y hoja "Leeme" con instrucciones.
- **Tests unit**: 19 invariants + 10 validate-payload + schemas Zod. Tests verdes
  cubren coma decimal europea, duplicados case-insensitive, FK orfanos.

### Changed

- `package.json` añade `exceljs` (~870KB, dynamic import en `/recipes/import`).
- `module-list.md` — 16 → 17 módulos (`import` insertado en #6).

### Verificación

- `npm run typecheck` — 0 errores.
- `npm run lint` — 0 warnings.
- `npm run test` — 217 tests verdes (29 nuevos).
- `npm run build` — 28 rutas (2 nuevas).
- Manual: aplicar migración 00054 en Supabase Dashboard antes de probar UI.

### Pendiente post-merge

- Aplicar migración `00054_sprint03c_import.sql` en Supabase Dashboard.
- Probar manualmente con xlsx real (5 recetas, 3 válidas, 2 con errores).
- Sprint-04-catalog: mapping bulk `product_id/unit_id` para ingredientes en
  estado "mapping pendiente" creados por este import.

## [0.4.0] - 2026-04-22

### Sprint-hardening — auditorías Codex + Antigravity

Sprint transversal de endurecimiento previo a `sprint-03c-import-excel`. Cierra
hallazgos confirmados de dos auditorías externas. Ver `.ai/sprints/sprint-hardening.md`.

### Added

- **`src/lib/errors/`** — catálogo transversal `AppError` (NotFound, Conflict, Unauthorized,
  Forbidden, Validation, RateLimited, Infrastructure) + `mapSupabaseError(raw, context)`
  para traducir PostgrestError/AuthError a la jerarquía. Cubre **API-001**.
- **`src/features/identity/domain/auth-errors.ts`** — `mapAuthError(raw, flow)` con catálogo
  cerrado: `invalid_credentials`, `email_not_confirmed`, `email_already_in_use`,
  `weak_password`, `rate_limited`, `network_error`, `generic`. Cubre **SEC-001**.
- **`src/lib/app-url/`** — `getCanonicalAppUrl()` + `buildAbsoluteUrl(path)` validan contra
  `APP_URL_ALLOWLIST`. Cubre **SEC-003**.
- **`src/lib/rate-limit/`** — `@upstash/ratelimit` + `@upstash/redis` con presets
  `login`/`signup`/`forgot-password`/`invite-accept`. Modo skip si vars vacías. Cubre
  **SEC-002**.
- **`src/lib/pagination/`** — `PaginationParams` + `PaginatedResult<T>` + helpers
  `pageRange`/`buildPaginatedResult`/`parseCursor`. Cubre **PERF-001**.
- **`src/lib/logger/`** — JSON estructurado + `newCorrelationId()` para tracing de errores.
- **`src/types/database.ts`** — stub con `Database`, `Tables<T>`, `Enums<T>`. Script
  `npm run db:types` regenera desde schema live. Cubre **ANTIGR-QW2**.
- **Server contracts**: `commercial/server.ts` (getEventDetailServer, etc.),
  `recipes/server.ts` (getRecipeWithIngredientsServer), `menus/server.ts`
  (getMenuWithSectionsServer). Cubre **ARC-001**.
- **`useEventsInfinite`, `useClientsInfinite`, `useRecipesInfinite`, `useMenusInfinite`,
  `useInvitesInfinite`** — hooks `useInfiniteQuery` para "Cargar más".
- **Headers HTTP** en `next.config.ts`: CSP nonce, HSTS 2 años, X-Frame DENY,
  X-Content-Type nosniff, Referrer-Policy strict-origin, Permissions-Policy mínimo.
  Cubre **SEC-004**.
- **ESLint boundaries**: `no-restricted-imports` prohíbe importar `domain/`,
  `application/`, `infrastructure/` de otro módulo. Cubre **ANTIGR-QW1**.
- **E2E** `e2e/tests/tenant-isolation.spec.ts` — 5 SELECTs + 2 INSERTs cross-hotel.
  Cubre **ANTIGR-SEC-01**.
- **E2E** `e2e/tests/auth-rate-limit.spec.ts` — 6 logins → 429.
- **ADR-0011** — rate-limit Upstash + headers HTTP + origin allowlist.
- **ADR-0012** — tipos Supabase autogenerados como fuente única de DB.

### Changed

- **Login/signup/forgot-password actions** dejan de devolver `error.message` crudo de
  Supabase. Mensajes neutros, log interno con correlation id. Forgot-password y signup
  devuelven mensaje neutro de éxito incluso ante fallo (anti-enumeración).
- **`createInviteAction`** ya no construye `origin` desde headers `host`/`x-forwarded-proto`.
  Usa `buildAbsoluteUrl()` validado contra allowlist por entorno.
- **`fetchEvents`, `fetchClients`, `fetchRecipes`, `fetchMenus`, `fetchInvites`** aceptan
  `pagination?: PaginationParams` y devuelven `PaginatedResult<T>`. Default 50, max 200.
- **Hooks `useEvents`, `useClients`, `useRecipes`, `useMenus`, `useInvites`** devuelven
  `PaginatedResult<T>`. Componentes consumidores adaptados a `data?.rows ?? []`.
- **Query keys** reorganizadas a `['modulo', hotelId, ...]` para invalidación scoped.
- **`useSwitchHotel`** ya no llama `queryClient.invalidateQueries()` global. Predicate
  invalida solo queries del hotel saliente/entrante + identity hotel-dependent. Cubre
  **PERF-002**.
- **Todas las `infrastructure/*-queries.ts`** (events, clients, beo, recipes, ingredients,
  steps, sub-recipes, escandallo, menus, sections, tenant, team, invites, identity)
  ahora envuelven los errores con `mapSupabaseError(error, { resource })`.
- **Páginas server** (`/events/[id]`, `/events/[id]/edit`, `/menus/[id]`, `/recipes/[id]`)
  migran de `infrastructure/*-queries` a contratos `*/server.ts`.
- **`.env.example`** añade `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
  `APP_URL_ALLOWLIST`.

### Verificación

- `npm run typecheck` — 0 errores.
- `npm run lint` — 0 errores, 0 warnings.
- `npm run test` — 188 tests verdes (incluye 39 nuevos: pagination 22 + errors 22 + auth-errors 11
  + app-url 11 + rate-limit 6).
- E2E nuevos gated por env vars; otros suites siguen verdes.

### Hallazgos descartados (no aplican)

- **ARQ-01 (Antigravity)**: index.ts ya existen en los 5 módulos productivos.
- **ARQ-02 (Antigravity)**: capa `infrastructure/` ya separa `SupabaseClient` de hooks.

### Fuera de scope (sprints futuros)

- **DB-001 (Codex)**: auditoría completa migraciones por bounded context (revisión).
- **OPS-001 (Codex)**: observability + DR runbook (sprint propio).
- **ID-DB-01 (Antigravity P3)**: mover RPCs PL/pgSQL masivos a Node.

## [0.3.0] - 2026-04-22

### Sprint-03 — recipes + sprint-03b — menus

- **Módulo `recipes` (15º oficial)**: fichas técnicas, ingredientes (CRUD inline + flag
  mapeo pendiente), pasos ordenados, sub-recetas, escandallo live (diff vs goods receipts),
  workflow draft → review_pending → approved → deprecated, calculate_recipe_cost,
  duplicate_recipe, scale_recipe.
- **Módulo `menus` (16º oficial, ADR-0010)**: composición comercial separada de recipes.
  Tablas `menus`, `menu_sections`, `menu_section_recipes`. Tipos buffet/seated/cocktail.
  Picker de recetas aprobadas en sections.
- **8 rutas nuevas**: `/recipes`, `/recipes/new`, `/recipes/[id]`, `/recipes/[id]/edit`,
  `/recipes/[id]/escandallo`, `/menus`, `/menus/new`, `/menus/[id]`.
- **ADR-0005-extensión-2** — Radix Tabs añadido al set base.
- **ADR-0010** — Módulo `menus` separado de `recipes`.

## [0.2.0] - 2026-04-22

### Sprint-02 — commercial + sprint-02b — tenant-admin

- **Módulo `commercial`** (ajustado por ADR-0008 al schema real v2): events, clients,
  event_spaces (1:N), event_menus, BEO PDF (@react-pdf/renderer aislado, ADR-0005-ext-1),
  state machine 8 estados (draft → pending_confirmation → confirmed → in_preparation →
  in_operation → completed → archived + cancelled), enum EventType inglés.
- **Módulo `tenant-admin` (15º al cierre, ADR-0009)**: onboarding completo (create_tenant_with_hotel),
  gestión de hoteles, team management (rol, activo/desactivado), invitaciones email + token
  con migración 00053 (tabla `invites` + 3 RPCs), integración Resend.
- **Rutas**: `/onboarding`, `/settings/hotels`, `/settings/team`, `/invite/[token]`.
- **ADR-0008** — Sprint-02 respeta schema real v2.
- **ADR-0009** — Módulo `tenant-admin` oficializado + arquitectura invitaciones email+token.

## [0.1.0] - 2026-04-21

### Added — Sprint 01 Identity

Primer módulo funcional: `features/identity/` con arquitectura DDD.

- **Módulo `identity`** con dos entry points:
  - `@/features/identity` — types, invariants, permissions, errors, client hooks.
  - `@/features/identity/server` — server helpers (`getCurrentUser`, `getActiveHotel`).
- **Domain layer**: 13 roles (`superadmin`, `direction`, `admin`, `head_chef`, `sous_chef`, `cook`, `commercial`, `procurement`, `warehouse`, `room`, `reception`, `operations`, `maintenance`), 4 UX profiles, matriz de 19 permisos, 3 errors tipados.
- **Application layer**: 5 client hooks (`useCurrentUser`, `useActiveHotel`, `useUserHotels`, `useSwitchHotel`, `useSignOut`), 4 server helpers con variantes `*OrNull`, 4 Zod schemas.
- **Infrastructure layer**: adapters Supabase para `get_active_hotel`, `get_user_hotels`, `switch_active_hotel`.
- **Auth pages** (Server Actions + Zod): `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/callback`.
- **Protected app** en route group `(app)`: layout guard + dashboard mínimo funcional con `HotelSwitcher`, `LogoutButton`, `UserBadge`.
- **Fallback**: `/no-access` para usuarios sin hotel activo.
- **Proxy endurecido**: strict en producción (error explícito si faltan env vars), pass-through con warning en dev/test.
- **E2E tests**: smoke + auth-proxy (sin Supabase) + auth-login, auth-signup, auth-forgot-reset (gated por env vars).
- **E2E seed**: `e2e/global-setup.ts` crea user test idempotente vía `service_role`.
- **Unit tests**: 18 tests nuevos (invariants 10 + permissions 8).

### ADRs registradas

- **ADR-0006** — `hotel_id` es el identificador de tenant en ChefOS (los specs genéricos que hablan de "tenant" se leen como "hotel" aquí).
- **ADR-0007** — Onboarding fuera de sprint-01 (queda para sprint-02 o dedicado).

### Changed

- `src/lib/supabase/middleware.ts` — endurecido con strict production / tolerante dev.
- `src/app/page.tsx` — eliminado (scaffolding). Ahora `/` lo sirve `src/app/(app)/page.tsx`.
- `e2e/tests/smoke.spec.ts` — ahora valida el formulario de `/login`.

### Notas de integración

- El dashboard `/` asume que el usuario tiene membership activa en al menos un hotel. Sin membership → redirect `/no-access`.
- `useSwitchHotel` invalida **todas** las queries del cliente al cambiar de hotel. Patrón heredado de v2; agresivo pero seguro vs cache cross-tenant.
- Cualquier Radix UI fuera del set base (ADR-0005) requiere ADR-0005-extensión.

## [0.0.1] - 2026-04-21

### Added

Scaffolding técnico inicial (sprint-00b).

- **Stack**: Next 16.2.3, React 19.2.4, TypeScript 5 strict, Tailwind v4 via `@tailwindcss/postcss`.
- **Supabase**: `@supabase/ssr` clientes browser + server + middleware (session refresh). Proyecto compartido con v2 (ADR-0003).
- **Radix UI set base** (ADR-0005): Dialog, DropdownMenu, Select, Label, Tooltip, Popover, Toast, Slot, Checkbox, Switch, RadioGroup, Separator, ScrollArea.
- **Data fetching**: TanStack Query 5 con `staleTime` 60s, retry 1.
- **Formularios**: React Hook Form + Zod 4.
- **Testing**: Vitest 4 (jsdom + testing-library), Playwright 1.59 (baseURL :3003, webServer en local). Coverage threshold 90% en `features/*/domain` + `features/*/application`.
- **Estructura**: `src/{app,components,features,lib,types}/` + `supabase/{migrations,functions,policies,rpcs,seeds}/` + `e2e/` + `.ai/` + `.github/workflows/`.
- **CI**: GitHub Actions con 4 jobs (lint-typecheck, test-unit, build, test-e2e gated por `vars.E2E_ENABLED`).
- **Configs**: ESLint (`eslint-config-next`), Prettier, editorconfig, `.nvmrc` (Node 20), Vercel (region cdg1).
- **Smoke**: `src/app/page.tsx` muestra "ChefOS v3 scaffolding OK". `src/lib/utils.test.ts` verifica Vitest. `e2e/tests/smoke.spec.ts` verifica Playwright.
- **Docs**: README, CLAUDE.md, CHANGELOG, `.ai/sprints/sprint-00b-scaffolding.md`.

### ADRs registradas

- **ADR-0004** — Scaffolding técnico aplicado.
- **ADR-0005** — Set base de Radix UI + regla de extensión por ADR.

### Notas de integración (verificación final sprint-00b)

- **`middleware.ts` → `proxy.ts`** (Next 16 deprecó `middleware`, ver https://nextjs.org/docs/messages/middleware-to-proxy).
- **Fuentes Google migradas a `next/font/google`** (antes iban vía `<link>`; la nueva forma inyecta CSS vars `--font-syne`, `--font-dm-sans`, `--font-dm-mono`, `--font-jetbrains-mono` consumidas desde `globals.css`).
- **`updateSession()` scaffolding-tolerante**: sin `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY`, pasa la request sin redirigir. Sprint-01-identity endurecerá el comportamiento.

### Verificación end-to-end ejecutada

- `npm install` — 568 paquetes, 0 vulnerabilidades.
- `npm run typecheck` — 0 errores.
- `npm run lint` — 0 errores, 0 warnings.
- `npm run test` — 3/3 passed (`utils.test.ts`).
- `npm run build` — compilación production OK (Turbopack).
- `npm run test:e2e` — 1/1 passed (`smoke.spec.ts`).

### No incluido

- Features de negocio (sprint-01 en adelante).
- Migraciones SQL reales.
- Auth funcional (login page es placeholder).
- Seeds reales.
