# Handoff - Sprint 05a Procurement PR/PO

**Fecha:** 2026-04-26  
**Rama:** `feature/sprint-05a-procurement-pr-po`  
**Base actual:** `6ce54db perf: optimize aggregateAllergens using flatMap and Set (#50)`  
**Estado:** implementación local terminada, sin commit realizado en esta sesión.

## Contexto

El usuario pidió continuar el sprint tras merge de PR #47. En `main` existe un commit extra `6ce54db` de PR #50 (`perf aggregateAllergens`), confirmado como no bloqueante.

Decisiones aplicadas:

- `sprint-05-procurement` se parte en `05a / 05b / 05c`.
- `05a` cubre solo PR/PO base: Purchase Requests, Purchase Orders, consolidación por proveedor, state machines, RLS, RPCs v3 y UI mínima.
- `05b` queda para Goods Receipts + inventory.
- `05c` queda para OCR de albaranes.
- `event.confirmed` genera PRs automáticamente mediante trigger idempotente sobre `v3_domain_events`.
- `event.cancelled` cancela PRs asociadas que aún no estén consolidadas.
- No se migra data v2 de procurement en 05a.

## Archivos principales

DB:

- `supabase/migrations/00063_v3_procurement_pr_po.sql`

Docs:

- `.ai/specs/decisions-log.md` - añade ADR-0016.
- `.ai/sprints/sprint-05-procurement.md` - documenta corte 05a/05b/05c y contratos 05a.

Tipos DB:

- `src/types/database.ts` aparece modificado con tipos generados para `v3_purchase_requests`, `v3_purchase_orders`, líneas y `v3_price_change_log`.
- Revisar en la próxima sesión si se quiere mantener como parte del PR o regenerarlo tras aplicar la migración real en Supabase.

Módulo:

- `src/features/procurement/index.ts`
- `src/features/procurement/domain/types.ts`
- `src/features/procurement/domain/invariants.ts`
- `src/features/procurement/domain/schemas.ts`
- `src/features/procurement/domain/errors.ts`
- `src/features/procurement/application/use-*.ts`
- `src/features/procurement/infrastructure/*-queries.ts`
- `src/features/procurement/components/*.tsx`

Rutas:

- `src/app/(app)/procurement/page.tsx`
- `src/app/(app)/procurement/purchase-requests/page.tsx`
- `src/app/(app)/procurement/purchase-orders/page.tsx`

Tests:

- `src/features/procurement/domain/invariants.test.ts`
- `src/features/procurement/domain/schemas.test.ts`
- `e2e/tests/procurement-routes.spec.ts`
- `e2e/tests/tenant-isolation.spec.ts` ampliado para PR/PO.

## Qué implementa 05a

Migración `00063`:

- Enums:
  - `v3_pr_status`
  - `v3_pr_origin`
  - `v3_po_status`
- Tablas:
  - `v3_purchase_requests`
  - `v3_purchase_request_lines`
  - `v3_purchase_orders`
  - `v3_purchase_order_lines`
  - `v3_price_change_log`
- RLS por `hotel_id` y roles operativos.
- FKs compuestas `(hotel_id, id)` para evitar mezcla cross-tenant en líneas y referencias.
- State machines:
  - PR: `draft -> approved -> consolidated`, cancelación desde `draft/approved`.
  - PO: `draft -> sent -> received_partial/received_complete -> closed`, cancelación desde `draft/sent`.
- RPCs:
  - `v3_create_purchase_request`
  - `v3_transition_purchase_request`
  - `v3_generate_purchase_order`
  - `v3_transition_purchase_order`
  - `v3_generate_purchase_requests_for_event`
  - internas para trigger de `event.confirmed` / `event.cancelled`.
- Trigger:
  - `v3_procurement_event_confirmed` sobre `v3_domain_events`.

Frontend:

- UI funcional y mínima para:
  - dashboard `/procurement`
  - crear PR manual de una línea
  - listar PRs, aprobar borradores y consolidar aprobadas
  - listar POs y marcar draft como enviado
- Páginas solo componen server context; no hay Supabase directo en `src/app` ni en componentes.
- Supabase vive en `infrastructure/`; UI consume hooks de `application/`.

## Verificación ejecutada

Comandos ejecutados y resultado:

- `npm run typecheck` - OK
- `npm run lint` - OK
- `npm test` - OK, 31 files, 333 tests
- `npm run build` - OK
- `npm run test:e2e -- e2e/tests/procurement-routes.spec.ts e2e/tests/tenant-isolation.spec.ts` - OK, 11 passed, 3 skipped

Notas:

- `npm test`, `npm run build` y Playwright requirieron ejecución fuera del sandbox por errores `EPERM` al crear procesos o escribir `.next/test-results`.
- Los 3 skips e2e corresponden a PR/PO RLS porque la Supabase apuntada por `.env.local` todavía no tiene aplicada la migración `00063`; el error original era `PGRST205` sobre tablas `v3_purchase_requests` / `v3_purchase_orders` ausentes en schema cache.
- Cuando `00063` esté aplicada, esos tests dejarán de saltarse y validarán RLS real.

Guardas estáticas ejecutadas:

- No se encontraron `.from()` / `.rpc()` fuera de namespace `v3_` en `src`/`e2e`.
- No se encontró `createClient` / `supabase` directo en rutas/componentes procurement.

## Estado git al guardar este handoff

Cambios modificados esperados:

- `.ai/specs/decisions-log.md`
- `.ai/sprints/sprint-05-procurement.md`
- `e2e/tests/tenant-isolation.spec.ts`
- `src/types/database.ts`

Archivos nuevos esperados:

- `.ai/sprints/sprint-05a-procurement-pr-po-handoff.md`
- `e2e/tests/procurement-routes.spec.ts`
- `src/app/(app)/procurement/**`
- `src/features/procurement/**`
- `supabase/migrations/00063_v3_procurement_pr_po.sql`

## Siguiente sesión recomendada

1. Leer `AGENTS.md` y los docs obligatorios `.ai/`.
2. Confirmar rama y estado:
   - `git branch --show-current`
   - `git status --short`
3. Revisar `src/types/database.ts`:
   - si refleja exactamente `00063`, mantenerlo;
   - si la migración se aplica a Supabase y cambia el output, regenerar con `npm run db:types`.
4. Aplicar o validar migración `00063` en el entorno Supabase que se vaya a usar.
5. Rerun:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm run test:e2e -- e2e/tests/procurement-routes.spec.ts e2e/tests/tenant-isolation.spec.ts`
6. Si todo pasa sin skips de migración, preparar commit/PR de 05a.
7. No empezar 05b hasta cerrar 05a o decidir explícitamente trabajar sobre esta misma rama.

## Pendiente para 05b

- Crear Goods Receipts (`v3_goods_receipts`, `v3_goods_receipt_lines`).
- Integrar recepción con `inventory` y lotes.
- Cerrar deuda de queries que aún dependan de compras v2 para escandallo/precios.
- Definir transición PO `sent -> received_partial/received_complete` con cantidades reales.

## Pendiente para 05c

- OCR albaranes.
- Upload foto + hash.
- Deduplicación.
- Matching de productos por alias.
- Cola de revisión.
- Rate limits.

## Memoria externa

La ruta indicada en AGENTS para memoria persistente:

`C:\Users\Israel\.Codex\projects\C--APLICACIONES-ChefOsv3\memory\`

no existe en este entorno. Este archivo queda como handoff persistente dentro del repo.
