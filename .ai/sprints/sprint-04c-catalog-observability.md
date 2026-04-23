# ChefOS v3 Sprint 04c — Catalog Observability (incidencias + métricas + eventos + precedencia GR)

## Objetivo

Cerrar el módulo `catalog` con incidencias automáticas de proveedor, métricas operativas y precedencia de precios GR > offer > manual. Integra el dominio completo de v2.

**Pre-requisito duro:** sprint-05-procurement cerrado. Sin `goods_receipts` reales, incidencias y métricas no tienen datos que alimentar y serían código muerto.

Referencia paraguas: [sprint-04-catalog.md](./sprint-04-catalog.md). ADR-0014.

## Alcance

### Incluye

- Tabla `supplier_incidents` (supplier_id, pedido_id, tipo enum, gravedad enum, impacto_evento bool, comentario, fecha).
- Enums `incident_type` (retraso, falta_producto, sustitucion, error_referencia, calidad), `incident_severity` (info, aviso, critico).
- RPC `record_supplier_incident(p_supplier_id, p_pedido_id, p_type, p_severity, p_comment) → uuid`.
- RPC `get_supplier_metrics(p_supplier_id, p_window_days int default 30) → jsonb` devuelve: `pct_orders_complete`, `pct_on_time`, `incidents_count_by_severity`, `avg_lead_time_hours_actual`.
- Trigger `auto_incident_from_goods_receipt` sobre `goods_receipts` (sprint-05): si `status = 'partial'` y faltan items → incidente tipo `falta_producto` severidad `aviso`; si lead_time real > config.lead_time_min_horas * 1.5 → `retraso`.
- Extensión de `get_catalog_prices` para precedencia **GR > offer_preferred > offer_cheapest > manual** (lee último GR por `product_supplier_ref` en ventana 30d).
- Bus de eventos dominio (mínimo funcional): tabla `domain_events` (id, event_type, aggregate_id, payload jsonb, occurred_at) + emisiones desde:
  - `products` insert/update → `product.created`, `product.price_changed` (si precedencia cambia).
  - `supplier_offers` insert/update → `supplier.offer_updated`.
  - `supplier_incidents` insert → `proveedor.incidencia_created`.
- UI:
  - `/catalog/suppliers/[id]` tab "Métricas" (cards con los 4 KPIs + histórico incidencias).
  - `/catalog/suppliers/[id]` tab "Incidencias" (listado + registro manual).
  - Badge en listado suppliers: gravedad máxima en 30d (verde/amarillo/rojo).
- Tests: ~15.

### No incluye

- UI de suscripción a eventos (solo persistencia). El consumer real viene en sprint-14-agents.
- Métricas trending (solo snapshot actual + últimos 30d). Trending va a sprint-08-reporting.

## Migraciones

- `00073_sprint04c_incidents.sql` — enums + `supplier_incidents` + RLS + RPC `record_supplier_incident`.
- `00074_sprint04c_metrics.sql` — RPC `get_supplier_metrics` + update `get_catalog_prices` con precedencia GR.
- `00075_sprint04c_events.sql` — tabla `domain_events` + triggers de emisión.
- `00076_sprint04c_auto_incidents.sql` — trigger sobre `goods_receipts` (requiere tabla de sprint-05).

## Contratos públicos (delta sobre 04b)

```typescript
export type { SupplierIncident, SupplierMetrics, DomainEvent } from './domain/types'
export { useSupplierIncidents, useRecordIncident } from './application/use-supplier-incidents'
export { useSupplierMetrics } from './application/use-supplier-metrics'
```

## Criterios de done

- [ ] Typecheck 0, lint 0, tests verdes (+ ~15 nuevos).
- [ ] Migraciones 00073-00076 aplicadas.
- [ ] Recibir GR partial dispara incidente automático con severidad correcta.
- [ ] `get_supplier_metrics` devuelve KPIs consistentes con los GRs de test.
- [ ] `get_catalog_prices` usa GR del último mes sobre offer si hay datos.
- [ ] `domain_events` se popula en cada operación relevante.
- [ ] Capability matrix actualizada, catalog marcado como "completo v1".

## Riesgos específicos

- **Trigger GR sin sprint-05 en prod**: la migración 00076 debe guardarse pero NO ejecutarse hasta que `goods_receipts` exista. Documentar.
- **`domain_events` tamaño**: tabla append-only. Incluir política de archivado (mover a partición trimestral cuando llegue a 100K filas). Estimado 1 año de uso antes de necesitarlo; documentar runbook.
- **Coste trigger price_history en cada GR**: opcional. Si degrada performance, mover a recálculo asíncrono vía cron job.
