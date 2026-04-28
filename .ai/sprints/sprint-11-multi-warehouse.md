# Sprint-11 — Multi-Warehouse

## Objetivo

Introducir almacenes físicos por hotel como dimensión adicional a `hotel_id`, manteniendo compatibilidad con inventory FIFO, procurement GR, production y compliance APPCC.

## Scope cerrado

- Tabla `v3_warehouses` con un almacén default por hotel.
- `warehouse_id` nullable/backfilled en `v3_inventory_lots`, `v3_inventory_movements` y `v3_compliance_equipment`.
- RPCs nuevas:
  - `v3_create_warehouse`
  - `v3_update_warehouse`
  - `v3_set_default_warehouse`
  - `v3_archive_warehouse`
  - `v3_transfer_lot_quantity`
  - `v3_get_stock_by_warehouse`
- Extensión backwards-compatible de RPCs existentes con `p_warehouse_id` opcional cuando aplica.
- UI:
  - `/warehouses`
  - `/warehouses/new`
  - `/warehouses/[id]`
  - `/inventory/transfer`
  - filtro `Almacén` en `/inventory`
- Integración visible:
  - columna `Almacén` en lotes y movimientos de inventario
  - selector `Almacén` en recepción de mercancía
  - selector `Almacén origen` en arranque de producción
  - selector `Almacén` al crear equipos APPCC

## Decisiones

- `warehouse_id` es nullable para compatibilidad, pero la migración backfillea datos existentes al default del hotel.
- FIFO sigue siendo hotel-wide si `p_warehouse_id` es `null`; si se informa, se restringe al almacén indicado.
- Transfer parcial hace split de lote y registra `transfer_out` + `transfer_in`.
- Transfer total cambia el `warehouse_id` del lote y registra movimientos append-only.
- Archivar queda bloqueado si el almacén es default o contiene stock activo.

## Permisos

Ver `.ai/specs/permissions-matrix.md § Warehouse`.

- CRUD operativo: `superadmin`, `direction`, `admin`, `head_chef`, `warehouse`.
- Default/archive: `superadmin`, `direction`, `admin`.
- Transfer: `superadmin`, `direction`, `admin`, `head_chef`, `sous_chef`, `warehouse`.
- Stock por almacén: cualquier miembro del hotel.

## Fuera de alcance

- Routing/ETA de transferencias.
- Transferencias cross-hotel.
- Límites de capacidad.
- Auto-balancing entre almacenes.
- Warehouse-level access control.

## Definition of Done

- Migración `00087_v3_warehouses.sql` añadida.
- `src/types/database.ts` refleja tabla, FKs y RPCs nuevas/extendidas.
- Módulo `src/features/warehouse` con dominio, infraestructura, hooks y componentes.
- Tests unitarios mínimos de schemas, invariants, RPC adapters y `TransferLotForm`.
- `npm run typecheck`, `npm run lint`, `npm test` y `npm run validate:permissions` pasan.
- README, module-list, decisions-log y permissions matrix actualizados.
