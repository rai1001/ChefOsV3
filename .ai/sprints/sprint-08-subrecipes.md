# ChefOS v3 Sprint 08 - Sub-recetas / preparaciones intermedias

## Objetivo del sprint

Permitir que una receta use otra receta stockable como ingrediente y que producción resuelva la cascada on-demand de forma atómica.

Salida operativa: cocina define una preparación como "Fondo de pescado" con producto de salida y luego la usa en una receta padre. Si falta stock de esa preparación al iniciar la producción padre, el sistema produce la sub-receta primero, crea el lote y después consume la receta padre.

---

## Estado del sprint

- Módulos afectados: `recipes`, `production`, `inventory`
- Tipo de sprint: funcional + DB + UI
- Rama: `feat/sprint-08-subrecipes`
- Supabase: `dbtrgnyfmzqsrcoadcrs`
- Migraciones: `00078_v3_subrecipe_schema.sql`, `00078_v3_inventory_movement_kind_produce.sql`, `00079_v3_subrecipe_validators.sql`, `00080_v3_subrecipe_rpcs.sql`

---

## Alcance funcional

### Recipes

- `v3_recipes.is_preparation` marca una receta como preparación stockable.
- `output_product_id` y `output_quantity_per_batch` definen el producto y cantidad producida por batch.
- `v3_recipe_ingredients.source_recipe_id` permite que una línea apunte a una receta-preparación.
- Triggers DB validan que la sub-receta existe, está activa, es preparación y su producto de salida coincide con `product_id`.
- La UI de receta permite marcar preparación y elegir producto/cantidad de salida.
- El editor de ingredientes permite elegir entre ingrediente de producto o sub-receta.

### Production

- `v3_check_production_feasibility` devuelve `subrecipe_chain` además de `deficits`.
- `v3_start_production` expande la cadena, produce sub-recetas con stock insuficiente y luego consume la orden padre.
- `v3_produce_subrecipe` crea sub-orden, inicia producción, crea lote `is_preparation=true` y movement `produce`.
- El detalle de producción muestra la cascada planificada y las sub-órdenes producidas.

---

## Fuera de alcance

- Mise en place anticipada o producción batched.
- Preparaciones multi-output.
- TTL/caducidad y alertas de preparaciones.
- Consolidación cross-orden de sub-recetas.
- Cancelar automáticamente sub-órdenes al cancelar la orden padre.

---

## Riesgos y mitigaciones

### Recursión excesiva

Mitigación: profundidad máxima 5 en DB; excederla falla `P0017`.

### Atomicidad de cascada

Mitigación: la cascada ocurre dentro de `v3_start_production`. Si falta stock terminal, Postgres revierte sub-órdenes, lots y movements.

### Carreras entre órdenes

Mitigación: no hay consolidación. Cada orden produce su sub-receta si la necesita. Los locks FIFO serializan consumo terminal.

### Recetas mutables

Mitigación: la orden padre conserva snapshot; las sub-recetas se calculan al iniciar usando la preparación vigente. Documentado en ADR-0020.

---

## Verificación

- WALL-E aplicó migraciones via MCP y validó smoke real en `dbtrgnyfmzqsrcoadcrs`.
- Chappie cubre schemas, adapters, hooks y E2E live gated `production-subrecipe-cascade.spec.ts`.

