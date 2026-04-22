# ChefOS v3 Sprint 03b - Menus

> Creado por ADR-0010 (2026-04-22) al separar menús de recipes. Se ejecuta en paralelo al sprint-03 dentro de la misma sesión, pero con módulo propio `src/features/menus/`.

## Objetivo del sprint

Construir el módulo `menus` (16º oficial) como owner de la composición comercial de menús: menú → secciones → recetas. Consume `@/features/recipes` por contrato público; consumido futuramente por `@/features/commercial` (BEO) y `@/features/reporting` (margen por menú).

---

## Estado del sprint

- Módulo principal: `menus` (16º, ADR-0010)
- Tipo: funcional
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
  - `sprint-03-recipes` (consume contratos públicos)
- Multi-tenant obligatorio

---

## Propósito del módulo `menus`

Owner de:

- Tabla `menus`, `menu_sections`, `menu_section_recipes` (ya existen en v2 desde migración 00006).
- Types: `Menu`, `MenuSection`, `MenuSectionRecipe`, `MenuType`.
- Hooks para CRUD.
- Agregación de alérgenos: unir alérgenos de todas las recetas en cada sección.

NO es owner de:

- Recetas → `recipes`.
- Eventos que usan menús → `commercial`.

---

## Alcance

### Incluye

- Domain layer con types, errores, invariantes (agregación de alérgenos, ordenamiento de secciones, formateo de precio).
- Infrastructure: CRUD sobre tablas menus / menu_sections / menu_section_recipes.
- Application: hooks client para listar, crear, editar menús + gestionar secciones + añadir/quitar recetas de secciones.
- Entry points `index.ts` (client) + `server.ts` (reservado).
- UI: lista menús, form crear/editar, editor de secciones con recipe picker, panel alérgenos agregados.
- Rutas `/menus`, `/menus/new`, `/menus/[id]`.

### No incluye

- Integración directa con eventos (lo hace commercial consumiendo `@/features/menus`).
- Export PDF del menú (futuro).
- Plantillas predefinidas (futuro).
- Traducción multi-idioma del menú (futuro).

---

## Entregables

1. `src/features/menus/` con dominio + infra + app + UI.
2. Rutas `/menus/*`.
3. ADR-0010 (ya incluida en sprint-03).
4. Tests unit del dominio (agregación alérgenos + orden secciones).

---

## Modelo de datos (v2 existente)

- `Menu` — id, hotel_id, name, description, menu_type ('buffet'|'seated'|'cocktail'|'tasting'|'daily'), is_template, target_food_cost_pct, total_cost, notes, is_active.
- `MenuSection` — id, menu_id, hotel_id, name, sort_order.
- `MenuSectionRecipe` — id, section_id, hotel_id, recipe_id, servings_override, price, sort_order.

---

## RPCs consumidas

Ninguna específica — CRUD simple sobre tablas. Si en el futuro se necesita cálculo agregado (total_cost derivado de suma de recipes), crear RPC dedicada.

---

## Contratos públicos (`src/features/menus/index.ts`)

Types: `Menu, MenuSection, MenuSectionRecipe, MenuType, MENU_TYPES, MENU_TYPE_LABELS, MenuAllergens`.

Hooks: `useMenus, useMenu, useCreateMenu, useUpdateMenu, useAddMenuSection, useRemoveMenuSection, useAddRecipeToSection, useRemoveRecipeFromSection`.

Errores: `MenuNotFoundError, SectionNotFoundError, RecipeAlreadyInSectionError`.

---

## Criterio DoD

- [ ] CRUD menús funcional.
- [ ] Editor de secciones con drag-drop (o sort numérico MVP).
- [ ] Recipe picker consume `@/features/recipes` sin tocar internals.
- [ ] Alérgenos agregados se muestran en panel (suma de recipes por sección).
- [ ] typecheck + lint + test + build pass.

---

## Fuera de alcance

- Drag-drop completo entre secciones (solo sort numérico en MVP).
- Versiones históricas de menús.
- Export a PDF/impresión estilo carta.
- Plantillas de menú predefinidas.

---

## Referencias cruzadas

- `.ai/specs/decisions-log.md § ADR-0010` — razón del módulo separado.
- `.ai/specs/module-list.md` — 16º módulo.
- `.ai/sprints/sprint-03-recipes.md` — sprint hermano.
- `.ai/sprints/sprint-02-commercial.md` — futuro consumer (BEO).

---

## Estado

Sprint 03b del módulo `menus`. Ejecutado 2026-04-22 en paralelo con sprint-03.
