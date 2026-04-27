# Sprint-06 — Inventory FIFO

**Fecha cierre**: 2026-04-26  
**Branch**: `feat/sprint-06-inventory-fifo`  
**PR**: #66  
**Estado**: implementación Chappie cerrada; smoke FIFO real pasado.

## Alcance

- Lotes FIFO en `v3_inventory_lots`.
- Movimientos append-only en `v3_inventory_movements`.
- RPCs:
  - `v3_register_lot_from_receipt`
  - `v3_decrement_inventory_fifo`
  - `v3_consume_inventory`
  - `v3_register_waste`
  - `v3_register_adjustment`
  - `v3_get_inventory_snapshot`
  - `v3_get_inventory_movements`
- Hook en `v3_receive_goods` para crear lotes automáticamente desde GR manual u OCR.
- Capa TS `src/features/inventory` con dominio, queries, RPC wrappers y hooks TanStack Query.
- UI:
  - `/inventory`
  - `/inventory/products/[id]`
  - `/inventory/products/[id]/consume`
  - `/inventory/products/[id]/waste`
  - `/inventory/products/[id]/adjustment`

## No-goals

- Consumo automático desde producción o recetas.
- Multi-almacén y transferencias entre hoteles.
- Reservas de stock.
- Reposición automática.
- Informes de variación.
- Alertas de caducidad.

## Migraciones

- `00072_v3_inventory_lots.sql`: tabla de lotes, índices FIFO, RLS RPC-only y FKs composite tenant.
- `00073_v3_inventory_movements.sql`: enum `v3_inventory_movement_kind`, ledger append-only y total generado.
- `00074_v3_inventory_rpcs.sql`: RPCs FIFO, snapshot y movimientos.
- `00075_v3_inventory_hook_into_procurement.sql`: redefine `v3_receive_goods` para crear lotes.

Aplicadas por WALL-E vía MCP en `dbtrgnyfmzqsrcoadcrs`. Advisors: sin alertas nuevas atribuibles a sprint-06.

## Verificación

- WALL-E SQL smoke:
  - Lote A `5@10`, lote B `5@12`.
  - `v3_decrement_inventory_fifo(qty=7,'consume')`.
  - Resultado: `total_cost=74`, `weighted_unit_cost=10.5714`, A queda `0`, B queda `3`.
  - Stock insuficiente `qty=100` con `3` disponibles falla con `P0002`.
- Chappie smoke real procurement:
  - PR manual → PO enviado.
  - Primera recepción `5@10` → PO `received_partial`.
  - Segunda recepción `5@12` → PO `received_complete`.
  - Hook crea 2 lotes automáticos con `goods_receipt_line_id`.
  - Consumo FIFO `7` → lotes consumidos A `5` + B `2`, coste total `74`, coste ponderado `10.5714`.
  - Movimientos: `receive`, `receive`, `consume`, `consume`.
  - Fixtures limpiados al final.
- Tests:
  - `npm test -- --run src/features/inventory`: 5 archivos, 14 tests PASS.
  - `npm run typecheck`: PASS.
  - `npm run lint`: PASS.
  - `npm run test:e2e -- e2e/tests/inventory-fifo-flow.spec.ts --project=chromium`: ruta inventory PASS; flujo FIFO live queda gated por `INVENTORY_E2E_LIVE=1`.

## Riesgos

- Concurrencia FIFO depende de locks `FOR UPDATE` sobre lotes activos.
- Snapshot puede requerir vista materializada si el volumen crece.
- Ajustes positivos sin histórico usan coste `0`; debe revisarse operacionalmente si aparece en uso real.
- Movements son append-only: deshacer se modela con movimiento compensatorio, no update.

## Pendiente

- Sprint-07 conectará producción con `v3_consume_inventory`.
- Multi-almacén, transferencias y alertas quedan para sprints posteriores.
