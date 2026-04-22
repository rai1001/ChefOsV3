# ChefOS v3 Sprint 03 - Recipes

> **AJUSTADO POR ADR-0010 (2026-04-22)**: menús se mueven a módulo separado `menus` (16º oficial, sprint-03b). Este sprint cubre solo recipes. Escandallo live INCLUIDO (hook + UI con diff vs último albarán). Import Excel FUERA de alcance → sprint dedicado `sprint-03c-import-excel` (feature imprescindible comercialmente, se hace después con foco total). Ver `.ai/specs/decisions-log.md § ADR-0010` y `§ ADR-0005-extensión-2`.

## Objetivo del sprint

Construir la base funcional inicial del módulo `recipes` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de recetas del sistema.

Este sprint no existe para resolver toda la lógica culinaria u operativa del producto.

Existe para definir y estabilizar la primera base operativa del módulo `recipes`.

---

## Estado del sprint

- Módulo principal: `recipes`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `recipes`

El módulo `recipes` es responsable del dominio de recetas dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- receta base
- composición o formulación mínima
- estructura funcional de ingredientes o componentes de receta
- estado base de receta
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de catálogo, procurement, inventario o producción.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `recipes` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad receta base del dominio
- su composición mínima
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `recipes` que permita:

- encapsular la lógica mínima del dominio de recetas
- exponer contratos públicos base del módulo
- evitar acceso caótico a recetas desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de recetas
- permitir que futuros módulos consuman `recipes` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `recipes`
- definición de frontera pública del módulo
- definición de contratos base del dominio de recetas
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la receta base y su composición mínima
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- catálogo completo de productos o ítems publicables
- procurement de ingredientes o insumos
- control de stock o movimientos de inventario
- ejecución completa de producción
- versionado avanzado de recetas
- automatizaciones sobre recetas
- migración masiva de legacy de recetas
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `recipes`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- catalog
- procurement
- inventory
- production
- reporting
- compliance
- automation
- notifications
- integrations
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `recipes`.
2. Evitar acceso improvisado a recetas desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de recetas se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la formulación avanzada del sistema.
2. Toda la relación entre recetas y catálogo.
3. Toda la relación entre recetas e inventario.
4. Toda la ejecución productiva basada en recetas.
5. Integraciones externas del dominio de recetas.
6. Reestructuración global de módulos consumidores.

---

## Dependencias del sprint

Este sprint depende de que los sprints anteriores ya hayan dejado cerrados:

- workflow oficial
- arquitectura oficial
- standards de código
- standards de testing
- política de migración
- definition of done
- plantilla oficial de módulos
- contrato base de `identity` para contexto de acceso y tenant

---

## Entregables del sprint

Los entregables esperados de Sprint 03 son los mínimos necesarios para dejar una base estable del módulo `recipes`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- receta base
- composición mínima de receta
- estado base de receta
- consulta de receta por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/recipes/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de receta
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 03 solo se considera cerrado cuando:

- `recipes` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La receta base no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de recetas.

---

## Tareas del sprint

### Tarea 03.01 - Definir responsabilidad exacta del módulo recipes

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 03.02 - Definir contrato público base de recipes

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 03.03 - Definir receta base, composición mínima y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de recetas sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de recetas definido por contrato

### Tarea 03.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de recetas

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 03.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 03.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `recipes` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de recetas

- **Mitigación:** limitar el sprint al contrato base y a la receta mínima del módulo

### Riesgo 2. Mezclar recipes con catálogo, inventario, procurement o producción

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir recetas

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de recetas en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/recipes/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 03, debe poder responderse:

- ¿está claro qué pertenece a `recipes`?
- ¿el resto del sistema puede consumir `recipes` sin invadir internals?
- ¿la receta base, su composición mínima y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 03 no está cerrado.

---

## Definition of Done del sprint

Sprint 03 está done solo cuando:

- el módulo `recipes` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la receta base está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 03, el proyecto debería quedar listo para que módulos posteriores puedan consumir `recipes` con un contrato estable, en lugar de resolver recetas de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 03 oficial del módulo `recipes` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe la especificación de `docs/MODULO_RECETAS.md` de v2 y la migración `00006_m2_recipes` + `00013_escandallo_live` + fix `00037_fix_workflow_ingredient_name`.

### Funcionalidades principales

- CRUD de recetas con escandallo (coste) automático.
- **Regla de oro**: todos los ingredientes mapean a Productos (no se permiten ingredientes libres salvo modo borrador con "pendiente de vincular").
- Rendimiento base + unidad + escalado por pax.
- Costeo recursivo con cycle detection (sub-recetas).
- State machine: draft → review → approved → deprecated.
- Versionado simple (receta activa + historial updated_at/updated_by).
- Duplicar receta como plantilla (para variantes).
- Importación Excel (2 hojas: recetas + ingredientes, o una tabla larga).
- Escandallo live: compara vs último albarán con indicador verde/azul/gris.
- Menús: composición por secciones (entrantes, principales, postres) con precio y alérgenos detectados.

### Modelo de datos

- `Recipe` — hotel_id, nombre, categoria, rendimiento_base, unidad_rendimiento, estado, elaboracion (text), coste_total_cache, coste_por_unidad_cache, version, updated_by.
- `RecipeIngredient` — receta_id, producto_id, cantidad, unidad_receta, merma_pct, orden, unit_cost (snapshot).
- `RecipeStep` — receta_id, orden, texto, tiempo_estimado.
- `SubRecipe` — recurso recursivo (recipe.parent_recipe_id vs recipe.child_recipe_id).
- `Menu` — hotel_id, nombre, tipo, estado.
- `MenuSection` — menu_id, nombre, orden, course_type.

### Contratos públicos (`src/features/recipes/index.ts`)

Types: `Recipe`, `RecipeIngredient`, `RecipeStep`, `SubRecipe`, `Menu`, `MenuSection`, `RecipeStatus`, `RECIPE_STATUSES`, `RECIPE_STATUS_LABELS`, `RECIPE_STATUS_VARIANT`.

Hooks:
- `useRecipes(filters?)`, `useRecipe(id)`
- `useCreateRecipe()`, `useUpdateRecipe()`, `useTransitionRecipe()`
- `useRecipeIngredients(recipeId)`, `useAddRecipeIngredient()`, `useRemoveRecipeIngredient()`
- `useRecipeSteps(recipeId)`
- `useEscandalloLive(recipeId)` — refetchOnWindowFocus, 2min interval
- `useSyncEscandalloPrices(recipeId)` — mutación refresh
- `useMenus()`, `useMenu(id)`, `useMenuSections(menuId)`

### Casos de uso (`application/`)

- `use-recipes.ts`, `use-recipe.ts`
- `use-recipe-mutations.ts` (create/update/transition)
- `use-recipe-ingredients.ts`
- `use-recipe-steps.ts`
- `use-escandallo-live.ts`, `use-sync-escandallo-prices.ts`
- `use-menus.ts`, `use-menu.ts`, `use-menu-sections.ts`
- `use-import-recipes.ts` (Excel)

### RPCs consumidas

- `create_recipe`, `update_recipe`, `transition_recipe`
- `add_recipe_ingredient(p_recipe_id, p_product_id, p_cantidad, p_unidad)`
- `get_escandallo_live(p_recipe_id)` — live vs albarán
- `sync_escandallo_prices(p_recipe_id)` — actualiza unit_cost desde GR más reciente
- `_recalc_recipes_using_product(p_product_id)` — trigger cascada cuando cambia precio
- `create_menu`, `add_menu_section`

### State machine

```
draft ──→ review ──→ approved ──→ deprecated
             │           │
             ↓           ↓
           draft       draft (via ADR, edición mayor)
```

Transiciones:
- `draft → review` — requiere ≥1 ingrediente mapeado, rendimiento definido
- `review → approved` — solo head_chef+ (ver `permissions-matrix.md`)
- `approved → deprecated` — conserva histórico, no borra
- `deprecated → approved` — requiere ADR (edición mayor)

### Eventos de dominio

Emite: `recipe.created`, `recipe.updated`, `recipe.approved`, `recipe.deprecated`, `recipe.cost_recalculated` (cascada desde `product.price_changed`).

Consume: `product.price_changed` → trigger `_recalc_recipes_using_product`.

### Tests mínimos

Unit: cycle detection en sub-recetas, escalado por pax (factor = pax_objetivo / rendimiento_base), state machine transitions.

Integration: add_recipe_ingredient con producto inexistente → rechazo, cascada de precios funciona end-to-end.

E2E: crear receta manual → añadir 5 ingredientes (productos existentes) → escandallo se calcula → submit to review → approve como head_chef.

### Criterio de done específico

- [ ] Costeo recursivo funciona con 3 niveles de sub-recetas (sin stack overflow).
- [ ] Ingrediente pendiente de mapeo bloquea transición a approved.
- [ ] Escandallo live refresca al cambiar precio producto en <5s.
- [ ] Import Excel con 100 recetas + 500 ingredientes completa en <30s.
- [ ] Menús con secciones + alérgenos detectados automáticamente.

### Referencias cruzadas

- `sprints/sprint-04-catalog.md` — Productos (prerequisito: ingredientes mapean a productos)
- `sprints/sprint-05-procurement.md` — consumidor: cambio de precio en GR dispara `recipe.cost_recalculated`
- `sprints/sprint-07-production.md` — consumidor: recetas → tareas de producción escaladas
- `skills/recipes/`
