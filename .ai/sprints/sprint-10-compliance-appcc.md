# Sprint-10 Compliance APPCC

## Estado

- Rama: `feat/sprint-10-compliance`
- PR: #87 draft
- Migración aplicada: `supabase/migrations/00082_v3_compliance_appcc.sql`
- Types regenerados: `src/types/database.ts`
- Scope TS/UI/docs: commits 2-6 del handoff `sprint-10-compliance-appcc-CODEX-fase2.md`

## Objetivo

Entregar APPCC v0 vendible y mantenible para cocina: recepción de mercancía, temperaturas de equipos, limpieza diaria/semanal/mensual y trazabilidad de lote FIFO.

## Source Of Truth

El schema real aplicado manda sobre el brief original:

- Enums:
  - `v3_compliance_equipment_type`: `fridge`, `freezer`, `blast_chiller`, `hot_holding`
  - `v3_compliance_frequency`: `daily`, `weekly`, `monthly`
- Tablas:
  - `v3_compliance_quality_checks`
  - `v3_compliance_equipment`
  - `v3_compliance_temperature_logs`
  - `v3_compliance_cleaning_areas`
  - `v3_compliance_cleaning_checks`
- RPCs:
  - `v3_record_goods_receipt_quality_check`
  - `v3_log_equipment_temperature`
  - `v3_complete_cleaning_check`
  - `v3_get_compliance_overview`
  - `v3_trace_lot`

## Entregado

- Capa `src/features/compliance/domain`: schemas Zod, filtros, errores y labels.
- Capa `application`: hooks TanStack Query para RPCs, overview, traceability, equipos, áreas y listados.
- Capa `infrastructure`: adapters Supabase RPC, queries directas permitidas por RLS y export CSV.
- Componentes: dashboard, forms de recepción/temperatura/limpieza, árbol de trazabilidad, managers de equipos y áreas.
- Rutas:
  - `/compliance`
  - `/compliance/quality`
  - `/compliance/temperature`
  - `/compliance/cleaning`
  - `/compliance/traceability`
  - `/compliance/equipment`
  - `/compliance/areas`
- API export:
  - `/api/compliance/export/quality`
  - `/api/compliance/export/temperature`
  - `/api/compliance/export/cleaning`
  - `/api/compliance/export/full-monthly`

## Export

El plan marcaba `pdf-lib` como opción A con fallback CSV si el bundle minified superaba 80 KB. En esta ejecución no se añadió `pdf-lib` porque la regla global del repo exige preguntar antes de añadir dependencias. Se entrega fallback CSV nativo y se documenta PDF para `compliance-advanced`.

## Eventos

Las RPCs emiten:

- `compliance.quality_checked`
- `temperature.logged`
- `temperature.out_of_range`
- `compliance.cleaning_completed`
- `lot.traced`

No se consumen en Sprint-10. Pertenecen a sprint-notifications futuro.

## Tests

- Unit: `src/features/compliance/domain/schemas.test.ts`
- Adapter: `src/features/compliance/infrastructure/compliance-rpcs.test.ts`
- Componentes:
  - `src/features/compliance/components/temperature-log-form.test.tsx`
  - `src/features/compliance/components/cleaning-log-checklist.test.tsx`
- E2E gated:
  - `COMPLIANCE_E2E_LIVE=1 npm run test:e2e -- e2e/tests/compliance-flow.spec.ts --project=chromium`

## Reglas Duras

- No modificar firmas RPC.
- No crear migraciones nuevas.
- No push a main.
- No consumir eventos en Sprint-10.
- No tocar tablas `v2_*`.
- No añadir alérgenos, fotos, firma digital, push notifications, multi-warehouse ni vista auditor externo.
