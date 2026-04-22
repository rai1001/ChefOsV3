---
name: ocr-delivery-notes-workflow
description: Workflow OCR de albaranes — foto → Claude Vision → goods receipt lines → cascada de precios. Incluye idempotencia, rate limits y fallback Mistral.
---

## Base obligatoria del proyecto

Antes de usar esta skill, confirmar:

- `.ai/specs/database-security.md` — reglas SECURITY DEFINER, Edge Functions con service_role, rate limits, idempotencia
- `.ai/specs/domain-events.md` — eventos emitidos (`ocr.receipt_processed`, `ocr.receipt_needs_review`, `product.price_changed`, `recipe.cost_recalculated`)
- `.ai/specs/permissions-matrix.md` — quién puede subir fotos y revisar OCR
- Supabase con migraciones OCR aplicadas (v2 migraciones 00039-00046)

---

## Alcance

Esta skill cubre:

- arquitectura completa del pipeline OCR
- esquema JSON que devuelve Claude Vision
- orden de ejecución de implementación
- criterios de éxito + métricas
- decisiones pendientes que hay que cerrar antes de arrancar

NO cubre:

- entrenamiento custom de OCR propietario (fuera de scope)
- OCR de facturas (es otro flujo, otro sprint)

---

## Stack oficial OCR

| Componente | Elección | Razón |
|---|---|---|
| Modelo OCR | **Claude Sonnet 4.6 Vision** (Anthropic API) | Razonamiento contextual (typos, abreviaturas, "kgs" vs "kg"), multilingüe perfecto, tool use nativo para JSON estructurado, coste ~$0.005/foto |
| Fallback | Mistral Pixtral | Si Claude falla o coste se dispara |
| NO usar | Google Document AI | Más complejo, mejor para volumen masivo no restaurante |

---

## Arquitectura

```
Usuario en /procurement/orders/[id]
   │
   ├─→ Cliente calcula SHA-256 hash del File (crypto.subtle.digest)
   ├─→ Upload a Storage delivery-notes/<hotel_id>/<hash16>.<ext> (upsert:true)
   │
   ├─→ insert goods_receipts (delivery_note_image_hash = hash)
   │   ↓
   │   unique index parcial (order_id, hash) → si existe, early return already_processed
   │
   ├─→ enqueue_job(type='ocr_receipt', payload={receipt_id, image_url, image_hash})
   │
   └─→ automation-worker toma el job → invoca Edge Function ocr-receipt
                                         │
                                         ├─→ Validar Authorization: Bearer <service_role>
                                         ├─→ consume_rate_limit('ocr:<hotel>:<hour>', 30, 3600)
                                         │      + 'ocr:<user>:<minute>', 5, 60
                                         ├─→ Early check vía delivery_note_image_hash
                                         │      (dedup DB-side antes de llamar a Claude)
                                         ├─→ Download imagen desde Storage
                                         ├─→ Llamar Claude Vision API con backoff
                                         │      (respeta Retry-After / exponencial 2^n*1000ms + jitter)
                                         ├─→ ocr_data = JSON estructurado
                                         ├─→ RPC process_ocr_receipt(receipt_id, ocr_data)
                                         │     │
                                         │     ├─→ match_product_by_alias cada línea
                                         │     ├─→ crear goods_receipt_lines
                                         │     ├─→ trigger auto crea stock_lots
                                         │     ├─→ detectar cambios precio vs PO line
                                         │     └─→ si delta >5%: price_change_log + alert
                                         │            + trigger cascada recipe_ingredients.unit_cost
                                         │
                                         ├─→ emit_event('ocr.receipt_processed') o ('ocr.receipt_needs_review')
                                         └─→ automation_jobs.status = completed
                                              + notification in-app
```

---

## Esquema JSON (Claude Vision output)

```json
{
  "supplier_name_detected": "Pescados Nores S.L.",
  "delivery_note_number": "ALB-2026-04812",
  "delivery_date": "2026-04-23",
  "lines": [
    {
      "raw_text": "Pulpo congelado 8 kg",
      "product_name_extracted": "Pulpo congelado",
      "quantity": 8.0,
      "unit": "kg",
      "unit_price": 18.50,
      "line_total": 148.00,
      "lot_number": "L-NORES-2604-A",
      "expiry_date": "2026-07-23",
      "match_confidence": null
    }
  ],
  "subtotal": 384.00,
  "vat_amount": 38.40,
  "total": 422.40,
  "warnings": ["línea 3 ilegible parcialmente"]
}
```

---

## Orden de implementación

### Bloque 1 — Backend (4-5h)

- [ ] Migración `purchase_order_lines.last_unit_price` (snapshot histórico)
- [ ] Tabla `price_change_log` (product_id, old_price, new_price, source, detected_at, delta_pct)
- [ ] RPC `match_product_by_alias(p_hotel_id, p_query text)`:
  - devuelve `{product_id, name, confidence}` ordenado
  - estrategia: ILIKE > similarity (pg_trgm) > unaccent
  - confidence ≥ 0.85 = auto-match
- [ ] RPC `process_ocr_receipt(p_hotel_id, p_receipt_id, p_ocr_data jsonb, p_image_hash text)`:
  - SECURITY DEFINER + check_membership
  - early return si hash ya procesado
  - por cada línea: match_product_by_alias
    - si ≥ 0.85 → crear goods_receipt_lines directo
    - si < 0.85 → quality_status='partial' + rejection_reason='ocr_review_needed'
  - insertar lot_number y expiry_date
  - detectar cambios precio vs PO lines
  - si delta >5% → insert price_change_log + crear alert
  - devolver `{lines_processed, lines_pending_review, price_alerts}`
- [ ] Trigger `trg_recalc_recipe_costs_on_price_change`:
  - cuando `price_change_log` insert → `_recalc_recipes_using_product(product_id)`
  - actualiza `recipe_ingredients.unit_cost` + `recipes.cost_per_serving` en cascada
- [ ] Edge Function `ocr-receipt`:
  - Input vía automation_jobs: `{receipt_id, image_url, image_hash}`
  - Validar Authorization header
  - Rate limits (2 buckets: hotel/hora y user/min)
  - Early check dedup por image_hash
  - Download imagen con service_role
  - Anthropic call con backoff (respect Retry-After / exponencial + jitter, cap 30s)
  - Llamar `process_ocr_receipt` RPC
  - emit_event + notification
  - Marcar job completed

### Bloque 2 — Storage (30 min)

- [ ] Crear bucket `delivery-notes` (privado, 10MB max)
- [ ] Policy: solo miembros del hotel upload/read su path `{hotel_id}/...`
- [ ] RLS en `goods_receipts.delivery_note_image_hash` (unique index parcial)

### Bloque 3 — UI (3-4h)

- [ ] `<DeliveryNoteUpload />` en `/procurement/orders/[id]`:
  - cliente calcula SHA-256 del File antes de upload
  - botón mobile-first con `capture="environment"`
  - preview + spinner mientras procesa
  - banner "Ya procesado" si dedup
- [ ] Pantalla `/procurement/ocr-review`:
  - líneas con `quality_status='partial'` + `product_unknown`
  - dropdown de top 3 sugerencias por confidence
  - drag para reasignar, ajustar cantidad/precio
  - botón "Confirmar y crear stock"
- [ ] Banner en PO: "⚠️ 3 productos cambiaron de precio. Escandallos recalculados. Ver impacto."

### Bloque 4 — QA + ajuste prompt (2h)

- [ ] 5 albaranes de prueba: pescado (Nores), carne (Bandeira), genérico, factura borrosa, ticket pequeño
- [ ] Iterar prompt hasta ≥90% accuracy en líneas
- [ ] Documentar coste real por imagen
- [ ] E2E: foto → matching → stock → escandallo recalculado → alert

### Bloque 5 — Docs (30 min)

- [ ] Actualizar `docs/modules/procurement.md` con sección OCR
- [ ] Documentar cómo añadir alias para productos mal detectados
- [ ] Entrada en `decisions-log.md` por decisiones pendientes cerradas

---

## Estimación total

**10-12h de trabajo concentrado** ≈ 2-3 jornadas.

---

## Métricas de éxito

- ≥85% líneas auto-matched sin intervención humana
- ≥90% accuracy en cantidades y precios extraídos
- <30s desde upload foto hasta stock actualizado
- 0 albaranes cruzados (un albarán se asocia a la PO correcta)
- Coste API < €0.01/albarán
- Rate limits: ninguna demo fallida por 429 en condiciones normales

---

## Decisiones pendientes (cerrar antes de arrancar)

1. Bucket `delivery-notes`: público o firmado? (recomendación: firmado)
2. ¿Mostrar imágenes en detalle del GR para auditoría posterior? (recomendación: sí, con rol check)
3. ¿Múltiples albaranes por misma PO? (caso real: llega en varios viajes)
4. ¿Email al head_chef cuando cambia precio, o solo in-app? (recomendación: in-app + digest diario)
5. ¿Producto OCR no en catálogo: auto-crear como pending vs descartar? (recomendación: pending review)

Registrar decisiones en `decisions-log.md`.

---

## Señales de problemas

- accuracy <85% → iterar prompt + añadir alias de productos frecuentemente mal matched
- coste >€0.02/albarán → revisar si se está llamando a Claude sin dedup
- rate limit 429 frecuente → ajustar buckets (actual: 30/hotel/hora + 5/user/min)
- escandallos no recalculan → verificar trigger `trg_recalc_recipe_costs_on_price_change` existe y está habilitado

---

## Relación con otros documentos

- `/.ai/specs/database-security.md` (SECURITY DEFINER, rate limits, idempotencia)
- `/.ai/specs/domain-events.md` (eventos emitidos)
- `/.ai/sprints/sprint-05-procurement.md` (donde se implementa)
- `/.ai/skills/procurement/` (skill de módulo)
