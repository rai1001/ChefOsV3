# ChefOS v3 CI Standards

## Objetivo

Este documento define los checks obligatorios que debe ejecutar el pipeline de integración continua (CI) y las condiciones bajo las cuales un cambio puede entrar a `main` o a ramas de release.

Su propósito es evitar:

- merges con código que no compila
- merges con tests rojos
- merges con cobertura inadecuada
- merges con errores de tipo
- merges que rompen flujos e2e críticos

Este documento es normativo.

---

## Principios

1. CI es la red de seguridad del proyecto.
2. Un check falla → el merge no ocurre.
3. Ningún bypass se permite salvo decisión explícita documentada.
4. La cobertura de tests es un criterio de calidad, no un burocratismo.
5. Los tests E2E protegen flujos críticos, no son opcionales.

---

## Checks obligatorios

Todo pull request debe pasar estos checks antes de mergear:

### 1. Lint

```
npm run lint
```

- ESLint debe pasar sin errores.
- Warnings son aceptables pero se registran.
- Configuración en `eslint.config.mjs`.

### 2. Typecheck

```
npm run typecheck
```

- TypeScript en modo strict sin errores.
- Configuración en `tsconfig.json`.
- No se permite `// @ts-ignore` sin justificación en comentario.

### 3. Unit tests

```
npm run test
```

- Todos los tests Vitest deben pasar.
- Configuración en `vitest.config.ts`.

### 4. Coverage

```
npm run test:coverage
```

- Threshold mínimo: **90%** en `src/features/*/domain/` y `src/features/*/application/` (dominio + casos de uso).
- UI components: cobertura proporcional al riesgo, sin mínimo forzado.
- Infraestructura (adapters Supabase): cobertura mínima para path feliz + errores clave.

### 5. E2E tests

```
npm run test:e2e
```

- Mínimo obligatorio en branches `main` y `release/*`.
- En feature branches puede gated por `vars.E2E_ENABLED` para ahorrar minutos.
- Los flujos cubiertos son los definidos en `docs/testing-strategy.md`.

### 6. Build

```
npm run build
```

- Build de producción debe completar sin errores.
- Bundle size no debe degradarse más de un 10% sin justificación.

---

## Bloqueos

### Merge bloqueado si

- cualquier check obligatorio falla
- el PR no está revisado estructuralmente
- la documentación requerida no se actualizó (ver `documentation-standards.md`)
- el alcance declarado no coincide con los cambios

### Merge a `main` requiere adicionalmente

- branch protection activa
- aprobación mínima de 1 reviewer
- CI verde en último commit del PR

---

## Secrets y variables de entorno de CI

### Requeridos

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase compartido
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — solo para seeds y edge functions en E2E

### Opcionales

- `E2E_BASE_URL` — URL de la app en test (default `http://localhost:3003`)
- `E2E_PORT` — puerto del dev server en E2E (default `3003`)
- `E2E_SKIP_SEED` — si el seed ya corrió en paso previo

### Variables de gating

- `vars.E2E_ENABLED` — activa el job de E2E

---

## Patrón de jobs

El workflow oficial tiene 4 jobs que corren en paralelo cuando es posible:

1. `lint-typecheck` — independiente, rápido
2. `test-unit` — independiente, rápido
3. `build` — depende de `lint-typecheck`, requiere secrets Supabase
4. `test-e2e` — depende de `lint-typecheck` + `build`, gated por `E2E_ENABLED`, ejecuta seed + arranca dev server + Playwright

El workflow detallado está en `.github/workflows/ci.yml`.

---

## Concurrency

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

Los runs anteriores del mismo ref se cancelan cuando llega un push nuevo. Esto ahorra minutos y acelera el feedback.

---

## Qué no debe hacerse en CI

- **No ejecutar migraciones contra producción** desde CI. Las migraciones son manuales y documentadas.
- **No publicar artefactos sin tag semántico.** Solo `release/*` o tags `v*.*.*` generan builds de producción.
- **No usar `--no-verify`** para saltar hooks locales.
- **No bypassear CI** salvo para hotfix crítico documentado en `decisions-log.md`.

---

## Señales de buen CI

- tiempo de feedback < 10 min por PR típico
- false positives mínimos
- cobertura estable o creciendo
- E2E verdes en main la mayoría del tiempo

---

## Señales de mal CI

- flaky tests recurrentes sin investigar
- cobertura bajando commit tras commit
- CI pasando pero producción rompiendo (gap de E2E)
- minutos gastados en runs canceladas sin concurrency

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/testing-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/prompts/ci-workflow-setup.prompt.md`
- `/.ai/checklists/release-runbook.md`

---

## Estado de esta especificación

Este documento define los estándares de CI para ChefOS v3.

Ningún cambio puede entrar a `main` sin cumplir estos checks.
