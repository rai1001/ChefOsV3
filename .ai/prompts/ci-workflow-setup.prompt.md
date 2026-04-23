# CI Workflow Setup — ChefOS v3

> Template YAML y guía para configurar GitHub Actions de ChefOS v3.

Referencia normativa: [`specs/ci-standards.md`](../specs/ci-standards.md).

---

## Archivo destino

`.github/workflows/ci.yml`

---

## Template completo

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  test-e2e:
    runs-on: ubuntu-latest
    needs: [lint-typecheck, build]
    if: ${{ vars.E2E_ENABLED == 'true' }}
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      E2E_BASE_URL: http://localhost:3003
      E2E_PORT: '3003'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Seed test hotel
        run: npm run db:seed

      - name: Start Next.js dev server
        run: npm run dev -- --port $E2E_PORT &

      - name: Wait for dev server
        run: npx wait-on http://localhost:3003 --timeout 60000

      - name: Run Playwright E2E
        run: E2E_SKIP_SEED=1 npx playwright test --reporter=github

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Configuración en GitHub (una vez)

### Secrets (Settings → Secrets and variables → Actions → Secrets)

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase compartido
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — solo usada por E2E para seed

### Variables (Settings → Secrets and variables → Actions → Variables)

- `E2E_ENABLED=true` — activa el job de E2E

### Branch protection (Settings → Branches → Branch protection rules)

Rule sobre `main`:

- ✅ Require a pull request before merging
- ✅ Require approvals (1 mínimo)
- ✅ Require status checks to pass:
  - `lint-typecheck`
  - `test-unit`
  - `build`
  - `test-e2e` (si `E2E_ENABLED=true`)
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

---

## Verificación post-setup

1. Push a una branch con cambio trivial
2. Abrir PR
3. Verificar que los 4 jobs aparecen y corren
4. Verificar que el merge está bloqueado hasta que pasen
5. Si `E2E_ENABLED=false`, el job test-e2e se salta silenciosamente (no fallar)

---

## Troubleshooting

| Síntoma                                      | Causa probable                  | Fix                                                 |
| -------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| Job `build` falla con "missing SUPABASE_URL" | Secrets no configurados         | Añadir en Settings → Secrets                        |
| E2E jobs tardan >15 min                      | Playwright deps cache no activo | Verificar `cache: npm` en setup-node                |
| Tests passing localmente, rojos en CI        | Diferencia de Node version      | Alinear `node-version: 20` en workflow con `.nvmrc` |
| Concurrency no cancela runs previos          | Grupo mal configurado           | Verificar `group: ci-${{ github.ref }}`             |

---

## Mantenimiento

- Revisar cada 6 meses si hay versiones nuevas de actions (`@v4` → `@v5`).
- Si aparece un flaky test en E2E: investigar antes de marcar `continue-on-error`.
- Si un job tarda >10 min consistentemente: splittear en sub-jobs o cachear más.

---

## Referencia

- `specs/ci-standards.md` — reglas normativas de CI
- `checklists/release-runbook.md` — pre-release checks
