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

## Módulos oficiales (14)

| # | Módulo | Responsabilidad principal | Sprint |
|---|---|---|---|
| 1 | `identity` | Auth, sesión, memberships, roles, perfiles UX | sprint-01 |
| 2 | `commercial` | Eventos, clientes, BEO, calendario comercial | sprint-02 |
| 3 | `recipes` | Recetas, ingredientes, pasos, costeo, menús | sprint-03 |
| 4 | `catalog` | Productos, categorías, proveedores, ofertas, alias | sprint-04 |
| 5 | `procurement` | PR / PO / GR, consolidación, OCR albaranes | sprint-05 |
| 6 | `inventory` | Lotes FIFO, reservations, counts, waste, forensics | sprint-06 |
| 7 | `production` | Workflows, mise en place, KDS, kanban, shopping list | sprint-07 |
| 8 | `reporting` | KPIs, food cost, variance, dashboard, alerts, snapshots | sprint-08 |
| 9 | `compliance` | APPCC, temperaturas, etiquetado, trazabilidad | sprint-09 |
| 10 | `automation` | Jobs queue, worker, triggers automatizados | sprint-10 |
| 11 | `notifications` | In-app Realtime, email, preferencias, severity | sprint-11 |
| 12 | `integrations` | PMS (Mews, OPERA), POS (Lightspeed, Simphony), sync | sprint-12 |
| 13 | `hr` | Personnel, shifts, schedules, rotación | sprint-13 |
| 14 | `agents` | 15 agentes asistidos (sugerencias, no autónomos) | sprint-14 |

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

- `identity` es owner de: auth flow, memberships, roles, perfiles UX, active hotel context.
- `commercial` es owner de: eventos, clientes, BEO, calendario, categorías comerciales.
- `recipes` es owner de: fichas técnicas, ingredientes, pasos, sub-recetas, costeo recursivo, menús.
- `catalog` es owner de: productos, categorías de producto, proveedores, ofertas, alias, supplier_refs.
- `procurement` es owner de: purchase requests, purchase orders, goods receipts, consolidación, OCR.
- `inventory` es owner de: lotes FIFO, movimientos, reservations, counts, waste, forensics.
- `production` es owner de: production plans, workflows, tasks, mise en place, kitchen orders, shopping list.
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

Ninguna implementación puede vivir fuera de estos 14 módulos sin ADR.
