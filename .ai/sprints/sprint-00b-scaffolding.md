# ChefOS v3 Sprint 00b - Scaffolding técnico

## Objetivo del sprint

Dejar el repo `ChefOsv3/` listo para desarrollar: Next.js 16 + el stack de ADR-0001, estructura oficial de carpetas, clientes Supabase, tests corriendo, CI, y una página smoke que compila. Sin features de negocio.

Este sprint cierra el gap entre el `sprint-00-foundation` (documental) y el `sprint-01-identity` (primer módulo).

---

## Estado del sprint

- Código de negocio: fuera de alcance
- Migración de legacy: fuera de alcance
- Implementación funcional de módulos: fuera de alcance
- Auth funcional: fuera de alcance (es sprint-01-identity)
- Scaffolding técnico del repo: dentro de alcance
- CI base: dentro de alcance
- Estructura de carpetas oficial: dentro de alcance
- ADRs técnicas (scaffolding, Radix): dentro de alcance

---

## Resultado esperado

Al cerrar este sprint el repositorio debe permitir:

- `npm install` limpio
- `npm run typecheck && npm run lint && npm run test && npm run build` verde
- `npm run dev` muestra "ChefOS v3 scaffolding OK"
- `npm run test:e2e` pasa el smoke (webServer auto)
- CI en GitHub Actions configurada (4 jobs)
- Estructura `src/features · src/lib · src/components · src/app · supabase · tests · e2e · .ai` completa
- Clientes Supabase listos para consumo en sprint-01
- ADR-0004 (scaffolding) y ADR-0005 (Radix set base) registradas

---

## Alcance del sprint

### Incluye

- `package.json` con stack ADR-0001 + Radix set base ADR-0005
- Configs raíz (tsconfig strict, next.config, eslint, postcss, prettier, editorconfig, nvmrc, vercel)
- Configs tests (vitest, vitest.setup, playwright)
- Estructura `src/` + READMEs de ownership por carpeta
- Clientes Supabase (browser + server + middleware)
- App root (layout, page, providers, globals.css con tokens industriales)
- Utility `cn()` + test smoke
- Estructura `supabase/` con 5 subdirectorios
- E2E smoke test
- `.env.example`, `.gitignore`
- README, CLAUDE.md, CHANGELOG
- CI GitHub Actions (4 jobs)
- ADR-0004 + ADR-0005

### No incluye

- Código en `src/features/*`
- Migraciones SQL reales
- Auth / login funcional
- Tests de integración o e2e más allá del smoke
- Design system refinado (es `skills/design-system-rollout`)
- Seeds reales
- Deploy en Vercel (solo config `vercel.json`)

---

## Módulo principal afectado

Transversal. No toca `features/*` — solo infraestructura del repo.

---

## Dependencias del sprint

- `sprint-00-foundation` cerrado (documental).
- ADR-0001, ADR-0002, ADR-0003 vigentes.
- Acceso a Supabase `dbtrgnyfmzqsrcoadcrs` para `.env.local`.

---

## Contratos públicos esperados

No hay contratos de módulo (no hay módulos todavía). La "superficie pública" del sprint son los scripts `npm run *` y la forma de `src/lib/supabase/{client,server}.ts`:

- `createClient()` (browser, de `@/lib/supabase/client`)
- `createClient()` (server async, de `@/lib/supabase/server`)
- `updateSession(request)` (middleware, de `@/lib/supabase/middleware`)

---

## Entidades de dominio

No aplica. Este sprint no crea entidades.

---

## Casos de uso

1. Un agente/humano puede clonar el repo, `npm install`, `npm run dev` y ver la home con "ChefOS v3 scaffolding OK".
2. Los checks `typecheck`, `lint`, `test`, `build` pasan en CI.
3. Un sprint posterior (sprint-01-identity) puede importar `@/lib/supabase/*` sin fricción.

---

## RPCs / Edge Functions / Storage

No se crean. Solo se dejan las carpetas listas con READMEs.

---

## State machines

No aplica.

---

## Eventos emitidos / consumidos

No aplica.

---

## Permisos y tenancy

No aplica (no hay tablas nuevas). El middleware `updateSession` sí redirige a `/login` para rutas protegidas, pero `/login` aún no existe — la ruta real la crea sprint-01-identity.

---

## Tests mínimos

- Unit: `src/lib/utils.test.ts` (3 casos: cn combine, cn filtra falsy, twMerge conflict).
- E2E smoke: `e2e/tests/smoke.spec.ts` (home page carga el texto esperado).

Coverage threshold 90% no se fuerza todavía (no hay archivos en `features/*/domain`). Se activará cuando sprint-01 añada su dominio.

---

## Documentación a actualizar

- `.ai/specs/decisions-log.md` — añadir ADR-0004 y ADR-0005. ✅
- `.ai/sprints/sprint-00b-scaffolding.md` — este archivo. ✅
- `CHANGELOG.md` raíz — entrada 0.0.1. ✅
- `README.md` raíz — quick start. ✅
- `CLAUDE.md` raíz — instrucciones para agente. ✅

---

## Criterios de cierre del sprint

1. `npm install` sin warnings críticos.
2. `npm run typecheck` → 0 errores.
3. `npm run lint` → 0 errores.
4. `npm run test` → 3 tests verdes (`utils.test.ts`).
5. `npm run build` → build production OK.
6. `npm run dev` → home muestra "ChefOS v3 scaffolding OK".
7. `npm run test:e2e` → smoke pasa.
8. Estructura oficial de carpetas completa (`architecture.md`).
9. ADR-0004 y ADR-0005 registradas.
10. Este documento presente y marcado como cerrado.
11. Ningún archivo en `src/features/*` (verificado `ls` vacío).

---

## Riesgos del sprint

### Riesgo 1. Versiones desalineadas con v2

- **Mitigación:** versiones ancladas exactamente a v2 (Next 16.2.3, React 19.2.4, etc.) para evitar incompatibilidades con Supabase compartido. Subir versiones requerirá ADR.

### Riesgo 2. Radix UI preinstalado pero no usado

- **Mitigación:** ADR-0005 define set base de 13 primitivos con uso previsto en sprints próximos. Tree-shaking impide que lo no usado llegue al bundle. Revisión tras sprint-08.

### Riesgo 3. Middleware `updateSession` redirige a `/login` que no existe

- **Mitigación:** middleware activo solo bajo rutas distintas a `/login|/signup|/callback|/forgot-password`. Hasta sprint-01-identity, visitar `/` triggeará redirect a `/login` → 404. Aceptable en scaffolding; el test smoke E2E apunta directamente a `/` y el middleware lo deja pasar mientras no haya auth real.
  _Nota_: si se quiere probar manualmente antes de sprint-01, desactivar middleware temporalmente o añadir `/` a `AUTH_FREE_PATHS`.

### Riesgo 4. CI E2E gated

- **Mitigación:** `if: vars.E2E_ENABLED == 'true'` en el job. Se habilita cuando sprint-01 añada seeds y secrets reales.

---

## Validación del sprint

Antes de cerrar, responder:

- ¿`npm install` limpio? ✅
- ¿Los 4 scripts principales pasan? ✅
- ¿La home carga el texto smoke? ✅
- ¿E2E smoke pasa? ✅
- ¿Estructura de carpetas respeta `architecture.md`? ✅
- ¿ADR-0004 y ADR-0005 registradas? ✅
- ¿Ningún código de negocio infiltrado? ✅

Si alguna respuesta es no → sprint no cerrado.

---

## Siguiente sprint previsto

- `sprint-01-identity` — auth + memberships + roles + UX profile.

Ya puede arrancar sobre base estable.

---

## Estado de este documento

Este archivo define el Sprint 00b oficial de ChefOS v3.

**Estado: CERRADO (2026-04-21)**.

Verificación final ejecutada:

| Check               | Resultado                        |
| ------------------- | -------------------------------- |
| `npm install`       | 568 paquetes, 0 vulnerabilidades |
| `npm run typecheck` | 0 errores                        |
| `npm run lint`      | 0 errores, 0 warnings            |
| `npm run test`      | 3/3 passed                       |
| `npm run build`     | OK (Turbopack)                   |
| `npm run test:e2e`  | 1/1 smoke passed                 |

Correcciones aplicadas durante verificación:

- `src/middleware.ts` → `src/proxy.ts` (Next 16 deprecó `middleware`).
- `src/app/layout.tsx` refactor a `next/font/google` (elimina warning `no-page-custom-font`).
- `src/lib/supabase/middleware.ts` scaffolding-tolerante (pass-through sin env vars).

Siguiente: **sprint-01-identity**.
