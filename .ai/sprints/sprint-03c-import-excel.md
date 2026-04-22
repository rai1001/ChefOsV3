# ChefOS v3 Sprint 03c - Import Excel (PLACEHOLDER)

> **Estado: pendiente de ejecución.** Creado como anchor doc tras decisión en sprint-03 (2026-04-22). Prioridad comercial alta según Israel: "tiene todo el mundo las recetas y escandallos en Excel lo necesitamos para eliminar friccion".

## Objetivo

Permitir al usuario importar desde Excel:

1. **Recetas + ingredientes** (bulk) — formato: 1 hoja recetas + 1 hoja ingredientes con FK por nombre o código.
2. **Escandallos / precios de productos** — formato: 1 hoja con product_name/SKU + precio unitario + unidad.

Objetivo de adopción: un hotelero con 200 recetas en Excel puede migrar a ChefOS v3 en <10 minutos.

---

## Dependencias

- sprint-03 (recipes) cerrado
- sprint-03b (menus) cerrado
- sprint-04-catalog (products) ideal pero no bloqueante

---

## Alcance propuesto

### Incluye

- Parser Excel client-side con librería `xlsx` o `exceljs` (elegir en plan mode).
- Formato de plantilla descargable (Excel template con columnas marcadas).
- Upload UI en `/recipes/import` y `/catalog/import` (ruta en módulo catalog cuando exista).
- Validación cruzada contra productos (si producto no existe → oferta crear o skipear).
- Mapeo de unidades (kg/g/l/ml/ud...) con normalización.
- Preview antes de ejecutar (tabla con errores/warnings).
- RPC `import_recipes_bulk(p_hotel_id, p_payload jsonb) → jsonb` — crea recetas en estado draft con ingredientes.
- RPC `import_products_prices_bulk(p_hotel_id, p_payload jsonb) → jsonb` — actualiza precios o crea productos.
- Migración nueva (número 00054+).
- Log de import: `import_runs` tabla con status, errores, affected rows.

### No incluye

- Import de menús (requiere relación a recetas ya importadas; sprint posterior).
- OCR de PDFs/fotos de recetas manuscritas (es compliance/procurement, no excel).
- Sincronización bidireccional Excel ↔ ChefOS.

---

## Decisiones pendientes de plan mode

- **Librería**: `xlsx` (SheetJS, AGPL) vs `exceljs` (MIT, más grande pero más features). Peso bundle vs licencia.
- **Client vs server parse**: parse en cliente (user feedback instantáneo) vs Edge Function (más pesado pero consistente).
- **Atomicidad**: todo-o-nada (RPC transaccional) vs parcial (importa lo válido, devuelve lista de errores).
- **Mapeo de productos inexistentes**: crear automáticamente vs bloquear import hasta mapeo manual.

---

## Estimación

~20-30 archivos: schemas + parser + validation rules + preview UI + RPC + migration + tests.

---

## Estado

PLACEHOLDER. Ejecutar tras cierre sprint-03 + sprint-03b. Reabrir con plan mode + AskUserQuestion para las 4 decisiones pendientes.
