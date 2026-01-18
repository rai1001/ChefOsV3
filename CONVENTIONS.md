# Convenciones de Proyecto

## Git: Conventional Commits
Formato:

```
<type>(<scope>): <summary>

<body opcional>

<footer opcional>
```

**Types** (más usados):
- `feat`: nueva funcionalidad
- `fix`: bug fix
- `refactor`: refactor sin cambio de comportamiento
- `test`: tests
- `docs`: documentación
- `chore`: tooling/infra
- `perf`: performance
- `security`: cambios de seguridad

**Scopes recomendados**:
- `auth`, `orgs`, `events`, `purchasing`, `inventory`, `staff`, `dashboard`, `importer`, `shared`, `db`, `rls`, `edge-functions`, `ci`, `deps`, `docs`

**Ejemplos**:
- `feat(events): add event wizard step for spaces`
- `fix(rls): restrict purchase_orders insert to members`
- `test(db): add pgTAP coverage for org isolation`

## Branching
- `feature/<tema>`
- `fix/<tema>`
- `chore/<tema>`
- `claude/<tema>` o `ai/<tema>` si es generado por IA

## Pull Requests (mínimo)
Incluye siempre:
- Qué cambia + por qué.
- Cómo probar (comandos + pasos UI).
- Riesgos/impacto.
- Checklist DoD (abajo).

## Definition of Done (DoD)
Antes de mergear:
- [ ] `npx supabase db reset`
- [ ] `npx supabase test db`
- [ ] `pnpm test --coverage` (umbral global >= **90%** en líneas; si baja, justificar en PR + tarea en `SPRINT.md`)
- [ ] `pnpm exec playwright test`
- [ ] Seeds idempotentes.
- [ ] RLS revisada (políticas + tests).
- [ ] Docs actualizadas en `docs/inventory/`.
- [ ] `SPRINT.md` actualizado.

## Testing (TDD recomendado)
### Unit/Integration (Vitest)
- Archivos: `*.test.ts` / `*.test.tsx`
- Preferir tests de **domain** (sin mocks complejos).
- UI: React Testing Library (si está configurado).

### E2E (Playwright)
- Ubicación: `e2e/*.spec.ts` o `tests/e2e/*`
- Objetivo: smoke de rutas críticas (login, dashboard, lista/detalle).

### DB (pgTAP)
- Ubicación: `supabase/tests/*.test.sql`
- Probar aislamiento por `org_id` y permisos por rol.

**Regla:** los tests de integración deben hablar con Supabase real (local CLI o staging). No se aceptan mocks de Postgres/RLS.

## Naming
- Variables/funciones: `camelCase`
- Componentes/Tipos: `PascalCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Archivos React: `ComponentName.tsx`
- Hooks: `useXxx`

## Estilo
- Preferir composición sobre herencia.
- Funciones pequeñas (ideal < 30 líneas).
- Sin `console.log` en producción.
- Errores: usar `AppError` y helpers (ver `ERROR_HANDLING.md`).
