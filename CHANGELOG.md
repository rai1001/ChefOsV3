# Changelog

Todos los cambios notables del proyecto se documentan aquí. Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado: [SemVer](https://semver.org/lang/es/).

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
