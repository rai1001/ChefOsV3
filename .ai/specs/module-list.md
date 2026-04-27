# ChefOS v3 Module List

## Objetivo

Este documento enumera los módulos oficiales de ChefOS v3, sus responsabilidades principales y la estructura mínima que cada uno debe tener.

Su propósito es evitar:

- creación de módulos no autorizados
- duplicación de ownership
- módulos con responsabilidades mezcladas
- módulos sin estructura mínima

Este documento es normativo.

---

## Principios

1. Solo existen los módulos listados aquí.
2. Crear un módulo nuevo requiere ADR.
3. Cada módulo tiene ownership único y claro.
4. Cada módulo expone contrato público vía `index.ts`.
5. Los módulos no se llaman entre sí: emiten eventos.

---

## Módulos oficiales (17)

| # | Módulo | Responsabilidad principal | Sprint |
|---|---|---|---|
| 1 | `identity` | Auth, sesión, memberships (consulta), roles, perfiles UX, active hotel context | sprint-01 |
| 2 | `commercial` | Eventos, clientes, BEO, calendario comercial | sprint-02 |
| 3 | `tenant-admin` | Tenants, hoteles (creación), memberships (mutación), invites email+token | sprint-02b |
| 4 | `recipes` | Recetas, ingredientes, pasos, sub-recetas, costeo recursivo, escandallo live | sprint-03 / sprint-08 |
| 5 | `menus` | Menús, secciones, recetas en secciones, alérgenos agregados, tipos | sprint-03b |
| 6 | `import` | Importación bulk desde Excel/CSV (recetas, productos, inventario, etc.) + import_runs log | sprint-03c |
| 7 | `catalog` | Productos, categorías, proveedores, ofertas, alias | sprint-04a / 04b / 04c (ADR-0014) |
| 8 | `procurement` | PR / PO / GR, consolidación, OCR albaranes | sprint-05 |
| 9 | `inventory` | Lotes FIFO, reservations, counts, waste, forensics | sprint-06 |
| 10 | `production` | Órdenes de producción, escalado de recetas, viabilidad de stock, cascada sub-recetas y consumo FIFO | sprint-07 / sprint-08 |
| 11 | `reporting` | KPIs, food cost, variance, dashboard, alerts, snapshots | sprint-09 |
| 12 | `compliance` | APPCC, temperaturas, etiquetado, trazabilidad | post sprint-09 |
| 13 | `automation` | Jobs queue, worker, triggers automatizados | sprint-10 |
| 14 | `notifications` | In-app Realtime, email, preferencias, severity | sprint-11 |
| 15 | `integrations` | PMS (Mews, OPERA), POS (Lightspeed, Simphony), sync | sprint-12 |
| 16 | `hr` | Personnel, shifts, schedules, rotación | sprint-13 |
| 17 | `agents` | 15 agentes asistidos (sugerencias, no autónomos) | sprint-14 |

> **Nota ADR-0009:** `tenant-admin` se añadió en sprint-02b. Convive con `identity` sin solape: identity resuelve sesión + active hotel context; tenant-admin mutante tenants/hoteles/memberships/invites. Ver `specs/decisions-log.md § ADR-0009`.

> **Nota ADR-0010:** `menus` se separó de `recipes` en sprint-03. Recipes posee fichas técnicas y escandallo; menus posee composición comercial (secciones, precios, alérgenos agregados). Consumido por commercial/BEO y reporting. Ver `specs/decisions-log.md § ADR-0010`.

> **Nota ADR-0013:** `import` se añadió en sprint-03c como módulo transversal de migración de datos desde Excel/CSV. Owner del log `import_runs` y de las RPCs `import_X_bulk(p_hotel_id, p_payload jsonb)`. Consume contratos públicos de los módulos destino (recipes, catalog futuro, etc.) sin tocar internals. Ver `specs/decisions-log.md § ADR-0013`.

> **Nota ADR-0015 (2026-04-24):** todos los objetos de DB que crea v3 llevan prefijo `v3_` (tablas, enums, RPCs, triggers, índices). Archivos de migración: `NNNNN_v3_<descripcion>.sql`. Tablas antes listadas sin prefijo se renombran en el rewrite iniciado en branch `feature/v3-namespace-rewrite`. Ver `specs/decisions-log.md § ADR-0015` y `specs/coding-standards.md § Naming de objetos de base de datos`.

> **Nota ADR-0018 (2026-04-26):** `inventory` se implementa con lotes FIFO y movimientos append-only. Procurement crea lotes mediante hook en `v3_receive_goods`; producción consume stock via `v3_consume_inventory`. Ver `specs/decisions-log.md § ADR-0018`.

> **Nota ADR-0019 (2026-04-27):** `production` arranca con órdenes monoreceta, snapshot de ingredientes escalados y consumo FIFO atómico al iniciar. Workflows, mise en place y KDS quedan fuera de sprint-07. Ver `specs/decisions-log.md § ADR-0019`.

> **Nota ADR-0020 (2026-04-27):** `recipes` y `production` incorporan sub-recetas stockables con cascada FIFO on-demand. Una preparación produce un solo producto, la cascada es all-or-nothing y la profundidad máxima es 5. Ver `specs/decisions-log.md § ADR-0020`.

> **Nota ADR-0021 (2026-04-27):** `reporting` arranca con dashboards read-only, RPCs SELECT-only y CSV nativo sin materialized views ni schedulers. Ver `specs/decisions-log.md § ADR-0021`.

---

## Estructura mínima por módulo

Cada módulo debe tener:

```
src/features/<module>/
  index.ts                     # contrato público (único punto de consumo externo)
  domain/
    types.ts                   # entidades, tipos de dominio
    [value-objects.ts]         # VOs si aplica
    [invariants.ts]            # reglas puras del dominio
  application/
    use-<case>.ts              # un archivo por hook / caso de uso
  infrastructure/
    <module>-queries.ts        # adapters Supabase (RPCs, selects)
    [<module>-events.ts]       # emisión de domain events si aplica
  [ui/]                        # componentes específicos del módulo, solo si se justifica
```

### Regla importante

La estructura es **proporcional al tamaño del módulo**. Un módulo pequeño puede tener solo `domain/types.ts` + `application/use-x.ts` + `infrastructure/x-queries.ts`. No se crea complejidad artificial.

Ver `specs/module-template.md` para la plantilla completa con cada sección a rellenar.

---

## Ownership explícito por módulo

### Qué pertenece a cada módulo

- `identity` es owner de: auth flow (sign in/up/out, recovery), sesión, consulta de memberships del user actual, roles enum, perfiles UX, active hotel context. NO es owner de crear/mutar memberships ni de onboarding.
- `tenant-admin` es owner de: crear/listar tenants, crear/listar hoteles bajo un tenant, mutar memberships (rol, activar/desactivar), emitir/aceptar/revocar invites email+token. Consume `identity` por contrato público.
- `commercial` es owner de: eventos, clientes, BEO, calendario, categorías comerciales.
- `recipes` es owner de: fichas técnicas, ingredientes, pasos, sub-recetas, costeo recursivo, escandallo live vs GR.
- `menus` es owner de: composición comercial de menús, secciones, recetas en secciones, alérgenos agregados, precios. Consume `@/features/recipes` por contrato público.
- `catalog` es owner de: productos, categorías de producto, proveedores, ofertas, alias, supplier_refs.
- `procurement` es owner de: purchase requests, purchase orders, goods receipts, consolidación, OCR.
- `inventory` es owner de: lotes FIFO, movimientos, reservations, counts, waste, forensics.
- `production` es owner de: órdenes de producción, snapshot de ingredientes escalados, viabilidad de stock, state machine productiva y orquestación del consumo FIFO de una orden.
- `reporting` es owner de: KPIs agregados, snapshots, dashboard data, alerts operacionales.
- `compliance` es owner de: APPCC templates + records, temperature logs, labels, trace_lot.
- `automation` es owner de: automation_jobs, triggers, worker logs.
- `notifications` es owner de: notifications, preferences, realtime, dispatcher.
- `integrations` es owner de: PMS integrations, POS integrations, sync logs, sync triggers.
- `hr` es owner de: personnel, shift_definitions, schedule_rules, assignments.
- `agents` es owner de: agent_configs, agent_suggestions, run/approve/reject workflow.

### Qué NO debe absorberse

- Ningún módulo es owner de `hotel_id` en sí mismo (es del sistema, cross-module).
- Ningún módulo consume internals de otro (solo contrato público).
- Ningún módulo absorbe responsabilidades de otro "por comodidad".

---

## Módulos no oficiales (prohibidos salvo ADR)

No son módulos oficiales y no deben crearse sin ADR:

- `analytics` — consolidado en `reporting`
- `documents` — los PDFs viven en el módulo que los origina (commercial para BEO, compliance para etiquetas, procurement para albaranes)
- `admin` — no es módulo sino un conjunto de features expuestas a `admin` role desde cada módulo
- `utils` — no es módulo, es `src/lib/utils.ts`

Crear uno de estos requiere ADR con justificación clara.

> **Nota sobre `admin`:** `tenant-admin` NO es un pseudo-módulo `admin` transversal. Tiene ownership específico (tenants, hotels creación, memberships mutación, invites). Ver ADR-0009.

---

## Orden de implementación

Los sprints tienen dependencias explícitas:

```
00 foundation
  ↓
01 identity
  ↓
02 commercial ──┐
03 recipes   ───┤
04 catalog   ───┼─→ 05 procurement ──→ 06 inventory ──→ 07 production
                │
                └─→ 08 reporting ──→ 09 compliance
                                        ↓
                          10 automation ──→ 11 notifications
                                        ↓
                          12 integrations ──→ 13 hr ──→ 14 agents
```

Ver cada `sprints/sprint-XX-*.md` para dependencias exactas.

---

## Señales de violación de ownership

- un hook `use-X` en módulo A toca datos cuyo owner es el módulo B
- un tipo del módulo A es copiado en el módulo B en vez de importado via public contract
- una RPC accede a tablas de dos módulos sin claridad de ownership
- un componente UI importa de dos módulos sin pasar por `features/<x>` public contracts

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/architecture.md`
- `/.ai/specs/module-template.md`
- `/.ai/specs/core-constraints.md`
- `/.ai/specs/domain-events.md`
- `/.ai/sprints/sprint-00-foundation.md` hasta `sprint-14-agents.md`

---

## Estado de esta especificación

Este documento enumera los módulos oficiales de ChefOS v3.

Ninguna implementación puede vivir fuera de estos 17 módulos sin ADR.
