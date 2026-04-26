# Sprint-05c — Procurement OCR

**Fecha**: 2026-04-26  
**Rama**: `feat/sprint-05c-procurement-ocr`  
**Base**: `main` post PR #64  
**ADR**: ADR-0017

## Alcance

- Storage privado `v3-procurement-uploads` para PDF/JPG/PNG hasta 8 MB.
- Tabla `v3_procurement_ocr_jobs` con estados `pending`, `extracted`, `reviewed`, `applied`, `rejected`, `failed`.
- RPCs `v3_create_ocr_job`, `v3_set_ocr_job_extracted`, `v3_set_ocr_job_failed`, `v3_review_ocr_job`, `v3_apply_ocr_job`, `v3_reject_ocr_job`.
- Edge Function `v3-procurement-ocr-extract` con JWT, membership, descarga Storage, Claude Vision, JSON estricto y rate limit Upstash 10/hotel/hora.
- UI `/procurement/ocr/upload`, `/procurement/ocr/jobs`, `/procurement/ocr/jobs/[id]`.
- Aplicación de OCR revisado contra `v3_receive_goods` y cascada de escandallos con `v3_sync_escandallo_prices`.

## No-goals

- No inventory batches ni movimientos de stock.
- No analítica de OCR.
- No matching automático por alias/producto fuera de selección humana contra líneas PO.
- No modo barato Haiku salvo petición explícita.

## Riesgos

- Coste Claude Vision: mitigado por SHA-256, idempotencia y rate limit.
- Secrets Edge Function: si faltan Upstash env vars, se documenta warning; `ANTHROPIC_API_KEY` sí es obligatorio para extracción.
- Types Supabase: `src/types/database.ts` debe regenerarse tras aplicar 00068-00070 por WALL-E.
- Cascada: si una factura afecta muchas recetas, considerar cola asíncrona en sprint posterior.

## Verificación local

- Unit/Vitest:
  - Schemas OCR extracted/reviewed.
  - Helpers Edge Function para parse JSON/base64.
  - Errores OCR como subclases `AppError`.
  - Hooks `useApplyOcrJob` y `useUploadOcrDocument`.
- E2E:
  - `e2e/tests/procurement-ocr-flow.spec.ts` queda gated por `OCR_E2E_LIVE=1` hasta aplicar migraciones en Supabase.

## Smoke previsto tras migraciones

1. Subir `factura-demo.pdf` en `/procurement/ocr/upload`.
2. Crear job idempotente por `sha256`.
3. Edge Function deja job en `extracted`.
4. Revisar payload, asignar línea PO y guardar.
5. Aplicar job: se crea `v3_goods_receipts`, se registra cambio de precio si aplica y se sincronizan escandallos dependientes.
6. Repetir aplicar: devuelve el mismo `goods_receipt_id`.
