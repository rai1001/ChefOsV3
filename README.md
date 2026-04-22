# ChefOS v3

Control operativo de cocina multi-servicio. Reescritura DDD del dominio validado en v2.

> Repo scaffolding nivel sprint-00b. Sin features de negocio todavía.

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
└── middleware.ts # Next middleware → supabase/middleware

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
