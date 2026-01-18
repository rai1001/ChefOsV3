# Sprint actual - Setup inicial (A0) - Operativo desde minuto 1

## Objetivo
Dejar el SaaS usable desde el minuto 1 (login + usuario seed + org seed + dashboard), conectado a Supabase desde el inicio, con base local reproducible y tests contra DB real.

## Backlog (A0)

### 1) Entorno local Supabase
- [x] `npx supabase start` funciona
- [x] `npx supabase db reset` aplica schema+migraciones y seed
- [x] Secrets locales configurados (sin hardcodear)

### 1.1) Usuario y organizacion seed (minuto 1)
- [x] Seed idempotente crea `org` de desarrollo y datos minimos
- [x] Script crea usuario inicial (email+password) y lo asigna a la org
- [x] Login con credenciales de dev entra a `/dashboard`

### 2) Base multi-tenant (orgs/members/hotels)
- [x] Tablas base creadas (`orgs`, `org_members`, `hotels`)
- [x] RLS habilitada + policies por `org_id`
- [x] Helpers RLS (`current_org_id`, checks de rol)
- [x] Tests pgTAP para aislamiento por org

### 3) App Shell + Auth minimo
- [x] Ruta `/login` funcional (UI en espanol)
- [x] Guard de rutas (redirigir si no hay sesion)
- [x] Layout base (AppShell: topbar/sidebar)

### 4) Rutas placeholder (sin logica compleja)
- [x] `/dashboard` renderiza y no rompe
- [x] `/events`, `/orders`, `/inventory`, `/staff`, `/settings` placeholders con PageHeader

### 5) Tooling y calidad
- [x] `pnpm test` verde
- [x] `pnpm test --coverage` con umbral global >= 90% (o excepcion documentada)
- [x] Playwright smoke (al menos login + dashboard) verde
- [x] Documentacion de setup en `docs/inventory/`

## Sprint P1 - Ajustes y usuarios (en progreso)

### 1) Admins pueden gestionar maestros y usuarios
- [x] Policies RLS para admins en `hotels`, `org_members`, `suppliers` y `products`
- [x] UI en `/settings` para crear hoteles e invitar usuarios
- [x] Tests pgTAP para escrituras admin en org

### 2) Calidad y consistencia
- [x] Onboarding atomico via RPC `onboard_user_org`
- [x] Manejo de errores con AppError + logging estructurado en `/api/admin/onboard`
- [x] Password minimo 8 caracteres en login (alineado con onboarding)
- [x] Ajuste de e2e login para selectores estables

## Regla de testing (importante)
- DB/RLS se valida con `npx supabase test db` (pgTAP).
- Tests de integracion deben hablar con Supabase real (local CLI o proyecto de staging), sin mocks de Postgres/RLS.

## Notas
- No mezclar modulos: cualquier feature nueva se hace como slice (ver `SLICES.md`).
- Cada MR debe actualizar este archivo y la bitacora en `docs/inventory/`.
