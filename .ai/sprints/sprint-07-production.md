# ChefOS v3 Sprint 07 - Production Orders

## Objetivo del sprint

Implementar el primer flujo productivo real de ChefOS v3: ordenes de produccion basadas en una receta, escaladas a raciones objetivo y conectadas con inventario FIFO de forma atomica.

Salida operativa: cocina puede crear una orden como "Menu diario lunes - 80 raciones del plato X", revisar ingredientes escalados, comprobar stock disponible e iniciar produccion consumiendo lotes FIFO con coste real.

---

## Estado del sprint

- Modulo principal: `production`
- Tipo de sprint: funcional + DB
- Rama: `feat/sprint-07-production`
- Dependencias cerradas:
  - sprint-05a/05b/05c procurement: PR/PO/GR/OCR y cascada de precios.
  - sprint-06 inventory: `v3_inventory_lots`, `v3_inventory_movements` y RPCs FIFO.
  - recipes: `v3_recipes`, `v3_recipe_ingredients`, escandallo live.
- Supabase: `dbtrgnyfmzqsrcoadcrs`
- Migraciones: `00076_v3_production_orders.sql`, `00077_v3_production_rpcs.sql`

---

## Ownership del modulo

`production` es owner de:

- ordenes de produccion
- snapshot de ingredientes escalados al crear la orden
- estado productivo de la orden
- validacion de viabilidad de stock para una orden
- orquestacion del consumo FIFO al iniciar produccion
- consulta de movimientos de inventario asociados a la orden

`production` no es owner de:

- formulacion de recetas ni sub-recetas
- lotes, movimientos o ajustes manuales de inventario
- compras, recepciones u OCR
- reporting de variacion coste estimado vs real
- asignacion de turnos, cocineros o equipos
- notificaciones externas o automatizaciones

La integracion con `recipes` e `inventory` se hace por contratos publicos/RPCs existentes, no importando internals de otros modulos.

---

## Alcance funcional

### 1. Ordenes de produccion

Crear:

- `v3_production_orders`
- `v3_production_order_lines`
- enum `v3_production_status`: `draft`, `scheduled`, `in_progress`, `completed`, `cancelled`

La cabecera guarda receta, raciones objetivo, estado, fechas, notas, usuario creador y costes estimado/real.

Las lineas son snapshot inmutable de ingredientes escalados al momento de crear la orden. Si la receta cambia despues, la orden no se recalcula.

### 2. Escalado de receta

RPC:

```sql
v3_scale_recipe(p_hotel_id, p_recipe_id, p_target_servings)
```

Devuelve lineas con:

- `product_id`
- `quantity_required`
- `unit_id`
- `estimated_unit_cost`

Es una funcion SQL, SELECT-only, sin mutaciones. El coste estimado usa ultimo lote conocido, ultima recepcion aceptada o `0`.

### 3. Crear orden

RPC:

```sql
v3_create_production_order(p_hotel_id, p_recipe_id, p_servings, p_scheduled_at, p_notes)
```

Crea cabecera `draft` y lineas snapshot via `v3_scale_recipe`. Devuelve:

- `order_id`
- `lines`
- `total_estimated_cost`

Roles permitidos: `superadmin`, `direction`, `admin`, `head_chef`, `sous_chef`.

### 4. Comprobar viabilidad

RPC:

```sql
v3_check_production_feasibility(p_hotel_id, p_production_order_id)
```

Devuelve:

```json
{
  "feasible": true,
  "deficits": []
}
```

Si falta stock, `deficits` incluye `product_id`, `required`, `available` y `missing`.

No muta datos. La UI lo ejecuta antes de permitir "Iniciar produccion".

### 5. Iniciar produccion

RPC:

```sql
v3_start_production(p_hotel_id, p_production_order_id)
```

Reglas:

- Solo desde `draft` o `scheduled`.
- Bloquea la orden y lotes candidatos.
- Re-valida viabilidad dentro de la transaccion.
- Si falta cualquier producto, falla con `P0002` y detalle de deficits antes de tocar inventario.
- Si hay stock, llama `v3_consume_inventory` por linea con `origin.source = 'production'`.
- Actualiza coste real consumido por linea.
- Actualiza cabecera a `in_progress` y acumula `actual_total_cost`.
- Emite `production.started`.

Atomicidad: todo o nada. Si falla cualquier linea, la transaccion completa hace rollback.

Roles permitidos: `superadmin`, `direction`, `admin`, `head_chef`, `sous_chef`, `cook`.

### 6. Completar y cancelar

RPCs:

```sql
v3_complete_production(p_hotel_id, p_production_order_id, p_notes)
v3_cancel_production(p_hotel_id, p_production_order_id, p_reason)
```

Completar:

- Solo desde `in_progress`.
- Marca `completed_at`.
- No consume inventario adicional.

Cancelar:

- Desde `draft` o `scheduled`: cambia a `cancelled` sin tocar stock.
- Desde `in_progress`: no restaura stock automaticamente.
- Anota los movements asociados con la razon de cancelacion para trazabilidad.

La restauracion de stock tras cancelar una produccion iniciada requiere ajuste manual via `v3_register_adjustment`.

### 7. Consultas

RPCs:

```sql
v3_list_production_orders(p_hotel_id, p_status, p_from, p_to, p_limit, p_offset)
v3_get_production_order(p_hotel_id, p_id)
```

El detalle devuelve cabecera, lineas y movements asociados filtrados por:

```sql
origin->>'source' = 'production'
origin->>'production_order_id' = p_id::text
```

---

## UI

Rutas:

- `/production` - listado con filtros de estado y fecha.
- `/production/new` - formulario de creacion con selector de receta, raciones, fecha programada y preview escalado.
- `/production/[id]` - detalle, costes, lineas, movements y acciones segun estado.
- `/production/[id]/cancel` - formulario de cancelacion con razon obligatoria.

Reglas UI:

- Las paginas solo componen componentes del modulo.
- Supabase se consume desde hooks/adapters de `src/features/production`.
- Si la viabilidad devuelve deficits, se muestran antes de permitir iniciar.
- No se añaden dependencias nuevas.

---

## Fuera de alcance

- Produccion multi-receta en una sola orden.
- Sub-recetas o preparaciones intermedias.
- Reporting historico de variacion estimado vs real.
- Reservas de stock previas al inicio.
- Asignacion de turnos, cocineros o equipos.
- Notificaciones o eventos externos fuera de `v3_emit_event`.
- Restauracion automatica de stock al cancelar una orden ya iniciada.

---

## Riesgos y mitigaciones

### Riesgo 1. Consumo parcial si falla una linea

Mitigacion: `v3_start_production` ejecuta pre-check interno y consumo por lineas dentro de una unica transaccion. Si una llamada a `v3_consume_inventory` falla, no quedan lotes ni movements parciales.

### Riesgo 2. Race condition entre check UI e inicio

Mitigacion: el check de UI es solo UX. `v3_start_production` bloquea lotes candidatos y re-valida viabilidad antes de mutar inventario.

### Riesgo 3. Receta mutable

Mitigacion: las lineas son snapshot al crear la orden. Cambios posteriores en receta no alteran la orden.

### Riesgo 4. Cancelacion desde `in_progress`

Mitigacion: no se restaura stock automaticamente para no falsear coste real. Se documenta en ADR-0019 y se requiere ajuste manual trazable.

### Riesgo 5. Recetas grandes

Mitigacion: el loop por lineas es aceptable para MVP. Si recetas de mas de 50 ingredientes son lentas, se evalua batch RPC en sprint posterior.

---

## Tests requeridos

Unit / Vitest:

- schemas Zod de orden, linea y viabilidad
- errores de dominio de production
- adapters DB -> dominio y mapeo `P0002`
- hooks de start/cancel con exito y deficit

E2E gated / Playwright:

- receta con dos ingredientes + lotes previos
- crear orden y preview escalado
- check feasibility OK
- start production consume FIFO y registra movements con origin production
- path insuficiente falla `P0002` y no toca inventario
- complete production marca `completed`
- cancel desde draft marca `cancelled`

---

## Definition of Done

- Migraciones `00076` y `00077` generadas, idempotentes y revisables.
- WALL-E aplica migraciones via MCP y valida advisors.
- `npm run db:types` se ejecuta despues de aplicar migraciones y `git diff --stat src/types/database.ts > 5000`.
- Smoke real: stock suficiente consume FIFO atomico y registra coste real.
- Smoke real: stock insuficiente falla con deficits y deja inventario intacto.
- Movements de produccion guardan `origin.source='production'` y `origin.production_order_id`.
- Cancelacion desde `in_progress` documentada: no restaura stock automaticamente.
- `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build` verdes.
- `.ai/checklists/pr-checklist.md` pasado entero antes de abrir PR final.
- Sin features fuera de alcance.

---

## Coordinacion con WALL-E

Chappie deja migraciones SQL locales en la rama. WALL-E aplica en Supabase via MCP, ejecuta smoke SQL, revisa advisors y regenera tipos.

Despues de `db:types`, Chappie continua con TS/UI/tests si fuera necesario y prepara PR a `main`.

---

## Estado de este documento

Este archivo define Sprint-07 oficial para `production` en ChefOS v3.

Sustituye el alcance heredado de workflows/KDS por ordenes de produccion con consumo FIFO atomico. Workflows, KDS, mise en place y shopping list quedan para sprints posteriores si se priorizan de nuevo.
