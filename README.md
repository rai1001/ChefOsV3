# ChefOS v3

Control operativo de cocina multi-servicio. Reescritura DDD del dominio validado en v2.

> Estado 2026-04-28: procurement PR/PO/GR/OCR en v3, inventory FIFO operativo, production orders/sub-recetas, reporting Sprint-09 y compliance APPCC Sprint-10 aplicados en Supabase.

## Capability matrix (2026-04-28)

| Módulo        | Estado       | Sprint      | Notas |
|---------------|--------------|-------------|-------|
| identity      | producción   | sprint-01   | auth, roles, permissions, active hotel, sanitización errores |
| commercial    | producción   | sprint-02   | events, clients, BEO PDF, paginación cursor |
| tenant-admin  | producción   | sprint-02b  | onboarding, hoteles, team, invites + Resend |
| recipes       | producción   | sprint-03/08 | fichas, ingredientes, pasos, sub-recetas stockables, escandallo live |
| menus         | producción   | sprint-03b  | composición comercial, sections, recipes nested |
| import        | producción   | sprint-03c  | bulk import Excel: recetas + ingredientes (mapping productos NULL pendiente) |
| catalog       | pendiente    | sprint-04   | productos, conversiones unidad — desbloquea mapping post-import |
| procurement   | producción   | sprint-05   | PR/PO/GR/OCR ✓; lotes vía hook inventory |
| inventory     | producción   | sprint-06   | lotes FIFO, movimientos, consumo, merma y ajustes |
| production    | producción   | sprint-07/08 | órdenes monoreceta, escalado, viabilidad, cascada sub-recetas y consumo FIFO atómico |
| reporting     | producción   | sprint-09   | dashboards read-only, food cost, mermas, top productos, precio y stock health |
| compliance    | producción   | sprint-10   | APPCC: recepción, temperaturas, limpieza, trazabilidad y export CSV |
| automation    | pendiente    | sprint-10   | workflows, alertas |
| notifications | pendiente    | sprint-11   | in-app, push, email |
| integrations  | pendiente    | sprint-12   | TPV, ERP, delivery |
| hr            | pendiente    | sprint-13   | turnos, fichaje |
| agents        | pendiente    | sprint-14   | asistentes IA |

Pre-features pendientes: `sprint-03c-import-excel` (importación Excel para recipes/menus).

Hardening cerrado en sprint-hardening: errores auth normalizados, rate limit Upstash,
paginación cursor en queries de lista, headers HTTP (CSP, HSTS), origin allowlist
para invitaciones, server contracts en commercial/recipes/menus, ESLint boundaries,
tests cross-tenant. Ver `.ai/sprints/sprint-hardening.md`.

## Quick start

```bash
# 1. Prerrequisitos
#    - Node 20 (ver .nvmrc). Con nvm: `nvm use`
#    - Cuenta Supabase con acceso al proyecto dbtrgnyfmzqsrcoadcrs (ver ADR-0003)

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env.local
# Rellenar NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY

# 4. Verificar
npm run typecheck
npm run lint
npm run test
npm run build

# 5. Dev server
npm run dev
# → http://localhost:3000 debe mostrar "ChefOS v3 scaffolding OK"
```

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Next dev con Turbopack en :3000 |
| `npm run build` | Build production |
| `npm run start` | Serve build production |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm run lint:fix` | ESLint con `--fix` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (unit + integration) |
| `npm run test:watch` | Vitest modo watch |
| `npm run test:coverage` | Vitest con cobertura (umbral 90% en features) |
| `npm run test:e2e` | Playwright E2E (dev server vía webServer) |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Procurement OCR

Edge Function local:

```bash
supabase functions serve v3-procurement-ocr-extract --env-file .env.local
```

Secrets necesarios en Supabase Functions para extracción real:

- `ANTHROPIC_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Si faltan las variables Upstash, la función registra warning y omite rate limit; si falta `ANTHROPIC_API_KEY`, el job queda `failed`.

## Inventory

Flujo operativo sprint-06:

- Cerrar una recepción de mercancía crea lotes FIFO automáticamente.
- `/inventory` muestra snapshot por producto.
- `/inventory/products/[id]` muestra lotes activos y movimientos.
- Acciones manuales: consumo, merma y ajuste.

Smoke live:

```bash
INVENTORY_E2E_LIVE=1 npm run test:e2e -- e2e/tests/inventory-fifo-flow.spec.ts --project=chromium
```

## Production

Flujo operativo sprint-07/08:

- `/production` lista órdenes con filtros por estado y fecha.
- `/production/new` crea una orden desde receta activa, raciones objetivo y preview de ingredientes escalados.
- `/production/[id]` muestra costes estimado/real, líneas snapshot, cascada de sub-recetas y movements asociados.
- Iniciar producción comprueba stock y consume inventario FIFO de forma atómica via `v3_start_production`.
- Si una línea usa una sub-receta stockable y falta stock, `v3_start_production` produce la preparación on-demand antes de consumir la orden padre.
- Las preparaciones generan lote `is_preparation=true` y movement `kind='produce'`.
- Si falta stock, `v3_start_production` falla con `P0002` y detalle de déficits antes de tocar inventario.
- Cancelar desde `in_progress` no restaura stock automáticamente; requiere ajuste manual auditable.

Smoke live:

```bash
PRODUCTION_E2E_LIVE=1 npm run test:e2e -- e2e/tests/production-fifo-flow.spec.ts --project=chromium
PRODUCTION_E2E_LIVE=1 npm run test:e2e -- e2e/tests/production-subrecipe-cascade.spec.ts --project=chromium
```

## Reporting

Flujo consultivo sprint-09:

- `/reports` concentra los cinco informes read-only.
- `/reports/food-cost` muestra coste real por receta y variación frente a estimado.
- `/reports/waste` muestra mermas por producto, coste y ratio contra consumo.
- `/reports/top-products` rankea productos por consumo, merma o volatilidad de precio.
- `/reports/price-changes` lista cambios de precio de compra desde `v3_price_change_log`.
- `/reports/stock-health` resume valor de stock, lotes próximos a caducar y stock muerto.
- Los CSV de informes tabulares se descargan desde Route Handlers nativos, con BOM UTF-8 y límite de 10.000 filas.
- La UI cachea consultas 5 minutos y permite refresco manual.

Smoke live:

```bash
PRODUCTION_E2E_LIVE=1 npm run test:e2e -- e2e/tests/reports-flow.spec.ts --project=chromium
```

## Compliance APPCC

Flujo operativo sprint-10:

- `/compliance` concentra overview de recepción, temperaturas y limpieza.
- `/compliance/quality` registra controles de recepción sobre `v3_goods_receipts`.
- `/compliance/temperature` registra temperaturas por equipo y muestra sparkline 7d.
- `/compliance/cleaning` completa checklist diario de áreas.
- `/compliance/traceability` traza lotes FIFO desde `v3_trace_lot`.
- `/compliance/equipment` gestiona equipos APPCC activos/inactivos.
- `/compliance/areas` gestiona áreas de limpieza y frecuencia.
- `/api/compliance/export/{quality|temperature|cleaning|full-monthly}` exporta CSV APPCC con guard `head_chef/admin/direction`.

PDF queda fuera de esta fase hasta aprobar dependencia y validar bundle minified <= 80 KB; no se añadió `pdf-lib`.

Smoke live:

```bash
COMPLIANCE_E2E_LIVE=1 npm run test:e2e -- e2e/tests/compliance-flow.spec.ts --project=chromium
```

## Arquitectura

Estructura oficial (ver `.ai/specs/architecture.md`):

```
src/
├── app/          # routing, layouts, composición
├── components/
│   ├── ui/       # UI reutilizable (Radix + CVA)
│   └── shell/    # sidebar, topbar, layouts de app
├── features/     # módulos de negocio (identity, commercial, recipes, ...)
├── lib/
│   ├── supabase/ # clients browser + server + middleware
│   ├── errors/   # catálogo canónico
│   ├── rbac/     # helpers permisos cliente
│   └── utils.ts  # cn() + utilidades puras
├── types/        # tipos transversales
└── proxy.ts     # Next middleware (renombrado a proxy) → supabase/middleware

supabase/
├── migrations/   # DDL + RLS + RPCs
├── functions/    # Edge Functions
├── policies/     # docs RLS (fuente legible)
├── rpcs/         # docs RPCs
└── seeds/        # seeds deterministas

tests/            # colocados junto al source (src/**/*.test.{ts,tsx})
e2e/              # Playwright
.ai/              # sistema operativo interno del proyecto
```

## Stack (ADR-0001)

- Next.js 16 (App Router + Turbopack) · React 19 · TypeScript 5 strict
- Supabase (Postgres 17, Auth, RLS, RPCs, Storage, Edge Functions)
- Tailwind CSS 4 · Radix UI (set base ADR-0005)
- TanStack Query 5 · React Hook Form · Zod 4
- Vitest (unit/integration) · Playwright (E2E)

No se reabre stack salvo ADR nueva.

## Documentación

- `.ai/README.md` — contrato base del proyecto.
- `.ai/WORKFLOW.md` — secuencia oficial de trabajo.
- `.ai/specs/*` — 19 specs normativas.
- `.ai/sprints/*` — sprints ejecutables.
- `.ai/checklists/*` — checklists PR, módulo, migración, release.
- `CLAUDE.md` — instrucciones para agentes asistidos.
- `CHANGELOG.md` — historial de versiones.

## Relación con ChefOS v2

- Mismo proyecto Supabase durante construcción (ADR-0003: `dbtrgnyfmzqsrcoadcrs`).
- v2 sigue vendible mientras v3 se construye.
- Fork cuando v3 diverja del schema.

## License

Proprietary — © 2026 Israel.
