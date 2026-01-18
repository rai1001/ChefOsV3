# Estrategia de Testing (objetivo >= 90%)

## Objetivo
Alcanzar **>= 90% de cobertura global** (líneas) en el código TypeScript y mantener una batería de tests de base de datos (RLS) que garantice seguridad y multi-tenancy.

## Entornos válidos (DB real)
1) **Local (recomendado para dev/CI):** Supabase CLI + Docker.
   - Comandos: `npx supabase start` y `npx supabase db reset`.
2) **Staging (opcional):** Proyecto Supabase separado (nunca producción).
   - Solo si se necesita validar integraciones remotas.

> Regla: tests destructivos (borrados, resets, truncates) solo en local o staging.

## Capas de tests

### 1) DB / RLS (pgTAP)
- Ubicación: `supabase/tests/*.test.sql`
- Ejecutar: `npx supabase test db`
- Qué cubrir:
  - CRUD permitido por rol y por pertenencia a organización.
  - Denegaciones: lecturas/escrituras cruzadas entre `org_id`.
  - RPCs: validación de permisos y constraints.

### 2) Integración (Vitest) contra Supabase real
- Ubicación sugerida:
  - `src/**/*.test.ts` (domain/data)
  - `src/**/*.test.tsx` (ui)
- Ejecutar: `pnpm test --coverage`
- Qué cubrir:
  - Adaptadores `data` (supabase-js) con DB real local.
  - Flujos críticos: login -> carga de perfil/membership -> lectura de datos.

Aislamiento recomendado:
- Prefijos únicos por suite (p.ej. `testRunId`) para no colisionar.
- Limpieza en `afterAll` o rollback si el harness lo permite.

### 3) E2E (Playwright)
- Objetivo: validar experiencia de usuario real.
- Ejecutar: `pnpm exec playwright test`
- Mínimo:
  - Smoke: login, dashboard, navegación a secciones.
  - Un flujo por slice: crear entidad, listar, ver detalle.

Consejo:
- Crear usuario de test por API (Admin) en setup y borrar al final.
- Evitar tests que dependan de correo real o redes externas salvo que el sprint lo pida.

## Umbrales y calidad
- `pnpm test --coverage` debe fallar si la cobertura global < 90%.
- Excepciones (temporales) deben:
  1) estar justificadas en el PR,
  2) crear una tarea en `SPRINT.md`,
  3) indicar fecha límite.

## Checklist por slice
- [ ] Migración + RLS + pgTAP
- [ ] Seed idempotente
- [ ] UI mínima funcional
- [ ] Tests (domain/data/ui)
- [ ] E2E si toca flujo crítico
- [ ] Documentación en `docs/inventory/`
