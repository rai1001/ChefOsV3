# Arquitectura (ChefOS reescritura)

## Objetivo
ChefOS es un SaaS para operaciones de F&B hotelero: eventos, producción, compras, inventario y staff. El sistema es **multi-tenant**: cada registro de negocio pertenece a una organización (`org_id`).

## Principios
- **Clean/Hexagonal ligero**: dominio aislado; infraestructura en adaptadores; UI desacoplada.
- **Módulos**: cada feature vive en `src/modules/<modulo>/{domain,data,ui}`.
- **Slices verticales**: las entregas son completas (DB+RLS+seed+UI+tests) y no mezclan módulos.
- **Seguridad por defecto**: RLS activada y verificada por tests.

## Estructura de carpetas (propuesta)

```
.
├─ src/
│  ├─ modules/
│  │  ├─ auth/{domain,data,ui}
│  │  ├─ orgs/{domain,data,ui}
│  │  ├─ events/{domain,data,ui}
│  │  ├─ purchasing/{domain,data,ui}
│  │  ├─ inventory/{domain,data,ui}
│  │  ├─ staff/{domain,data,ui}
│  │  └─ shared/{domain,data,ui}
│  ├─ lib/
│  │  ├─ supabase/ (client/server init si aplica)
│  │  └─ shared/ (errores, logger, utilidades)
│  └─ app/ o routes/ (según framework)
├─ supabase/
│  ├─ migrations/
│  ├─ functions/
│  └─ tests/ (pgTAP)
└─ docs/
   └─ inventory/ (bitácora de cambios)
```

## Capas

### Domain
- Tipos (`type`, `interface`), invariantes, reglas de negocio, casos de uso.
- Sin dependencias de React/Supabase.
- Errores de negocio explícitos (ej. `ValidationError`, `ConflictError`).

### Data
- Adaptadores a Supabase (queries, RPCs, storage) y/o edge functions.
- Mapeo `snake_case`↔`camelCase` cuando sea necesario.
- Traducción de errores a `AppError` (ver `ERROR_HANDLING.md`).

### UI
- Páginas/rutas y componentes.
- Hooks de datos con TanStack Query.
- Formularios con RHF + Zod.
- Estados coherentes: loading / empty / error / success.

## Flujo de datos (alto nivel)
1) UI llama a un adapter `data` (query/RPC) → devuelve tipos `domain`.
2) UI cachea y sincroniza con TanStack Query.
3) Mutaciones:
   - Preferencia: escribir con anon + RLS.
   - Si se requiere privilegio: server-side (server actions/route handlers) o Edge Function.

## Seguridad: multi-tenancy
- Todas las tablas de negocio incluyen `org_id`.
- RLS habilitada y políticas por tenant.
- Helpers de RLS: `current_org_id()` y verificación de rol en membership.

## Rutas principales (producto)
- `/login` → login
- `/dashboard` → KPIs + timeline
- `/events` / `/events/new` → listado + wizard
- `/inventory` → inventario y caducidades
- `/orders` → pedidos
- `/staff` → calendario de staff
- `/settings` → maestros

## Integraciones
- Supabase Auth + RLS
- RPCs para dashboard/importer
- Edge Function `ocr_process` (OCR + IA)
- Deploy: Vercel + Supabase

## Decisiones clave
- Ver `docs/reference/DECISIONS.md` y `docs/reference/ROADMAP.md` para el plan por slices y módulos.
