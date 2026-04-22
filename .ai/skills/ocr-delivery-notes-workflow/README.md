# Skill — ocr-delivery-notes-workflow

## Propósito

Workflow operativo para procesar albaranes de proveedor mediante OCR (Claude Vision) y actualizar automáticamente stock, precios y escandallos.

Es la feature estrella de ChefOS v3 — convierte foto de albarán → goods receipt lines + cascada de recálculo de costes.

## Cuándo usar

- Cuando se implementa el módulo `procurement` en Sprint 05.
- Cuando se debe recrear el pipeline OCR en otro entorno.
- Cuando se depura el flujo OCR (fallos, baja accuracy).
- Cuando se añade un proveedor nuevo y hay que validar que el OCR lo lee bien.

## Arquitectura (resumen)

Cliente foto → Storage `delivery-notes/<hotel_id>/<hash>.jpg` → `enqueue_job(ocr_receipt)` → Edge Function `ocr-receipt` → Claude Vision API (tool use JSON) → `process_ocr_receipt` RPC → `goods_receipt_lines` + `price_change_log` + cascada `recipe_ingredients.unit_cost` + notification.

Ver SKILL.md para detalle completo.

## Referencia

Basado en el plan de v2 (sprint post-demo, 2026-04-16). Validado end-to-end con albaranes reales.
