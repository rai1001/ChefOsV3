# ChefOS v3 Sprint 03c — Import Excel para recetas + ingredientes

## Objetivo del sprint

Permitir al usuario migrar a ChefOS v3 sus recetas desde Excel sin tener que reescribir nada manualmente. Israel: "tiene todo el mundo las recetas y escandallos en Excel lo necesitamos para eliminar fricción". Objetivo: un hotelero con 200 recetas puede subir su Excel y verlas en el sistema en <10 minutos.

Este sprint introduce el **17º módulo `import`** (ADR-0013) como owner transversal de migración bulk. Cubre primero recetas + ingredientes. Sprints futuros (catalog, inventory) reusarán la infraestructura.

---

## Estado del sprint

- Módulo principal: `import` (nuevo, registrado en ADR-0013).
- Módulo destino: `recipes` (consume vía RPC bulk, no toca internals).
- Tipo: funcional + migración SQL + librería externa (exceljs).
- Dependencias:
  - sprint-03 (recipes) cerrado.
  - sprint-03b (menus) cerrado.
  - sprint-hardening cerrado (mapSupabaseError, paginación, server contracts disponibles).
- Multi-tenant, permisos y límites de módulo: obligatorios.

---

## Decisiones (ADR-0013)

- **Módulo separado `import`** (no ampliación de recipes). Reusable para sprints futuros.
- **Librería**: `exceljs` (MIT). Lectura para parse + escritura para template generator.
- **Arquitectura**: **híbrida** — parse en cliente (preview instantáneo) → server action valida con Zod → RPC bulk commitea.
- **Atomicidad**: **parcial** — RPC commitea las válidas + devuelve `{ ok_count, failed: [{ row_index, name, errors[] }] }`. UI permite descargar CSV de fallidas.
- **Mapeo productos/unidades**: **NULL en import** — `product_id` y `unit_id` quedan null. UI ya soporta el flag "mapping pendiente" via `unmappedIngredients()`. Sprint-04-catalog añadirá mapping bulk post-import.

---

## Alcance

### Incluye

- Migración `00054_sprint03c_import.sql`:
  - Enum `import_kind` (`recipes`, futuro: `products`, `inventory`).
  - Enum `import_status` (`pending`, `running`, `completed`, `partial`, `failed`).
  - Tabla `import_runs` con RLS por hotel.
  - RPC `import_recipes_bulk(p_hotel_id uuid, p_payload jsonb) → jsonb` SECURITY DEFINER. Inserta recetas + ingredientes, registra run, devuelve `{ run_id, ok_count, failed[] }`.
- Módulo `src/features/import/`:
  - `domain/types.ts`: `ImportKind`, `ImportStatus`, `ImportRun`, `ParsedRecipeRow`, `ParsedIngredientRow`, `ImportResult`, `ImportFailure`.
  - `domain/errors.ts`: `ExcelParseError`, `MissingSheetError`, `RowValidationError`, `ImportRunNotFoundError`.
  - `domain/invariants.ts`: `normalizeRecipeName(name)`, `parseAllergensCSV(s)`, `parseTagsCSV(s)`.
  - `application/parse-excel.ts`: usa exceljs para leer ArrayBuffer → `{ recipes: ParsedRecipeRow[], ingredients: ParsedIngredientRow[] }`.
  - `application/schemas.ts`: Zod `parsedRecipeRowSchema`, `parsedIngredientRowSchema`, `importRecipesPayloadSchema` (cross-validation: cada ingredient.receta_nombre debe matchear una recipe.nombre).
  - `application/upload-and-validate-action.ts`: server action recibe payload JSON, valida Zod, llama RPC.
  - `application/use-import-recipes.ts`: hook React Query mutation.
  - `application/use-import-runs.ts`: hook lista historial.
  - `infrastructure/import-queries.ts`: `importRecipesBulk(supabase, hotelId, payload)`, `fetchImportRuns(supabase, hotelId, pagination?)`.
  - `components/import-recipes-form.tsx`: file input + parse client + preview + confirm.
  - `components/import-preview-table.tsx`: tabla con status por fila (válido/error/warning) + counts header.
  - `components/import-result-summary.tsx`: tras RPC muestra ok/fail counts + descarga CSV errores.
  - `components/template-download-button.tsx`: link a `/api/import/template/recipes`.
  - `server.ts`: contrato server-only (`getImportRunServer`).
  - `index.ts`: contrato público.
- Ruta `src/app/(app)/recipes/import/page.tsx`.
- Endpoint `src/app/api/import/template/recipes/route.ts`: genera xlsx runtime con headers + 1 receta de ejemplo.
- CTA "Importar desde Excel" en `/recipes` (junto a "Nueva receta").
- Tests unit: parser (exceljs mock), schemas Zod (rechaza filas inválidas), invariants (normalizeRecipeName, parseCSV).
- ADR-0013 + actualización module-list (17 módulos).

### No incluye

- Import de menús (necesita FK a recipes ya importadas; sprint posterior).
- Import de productos (sprint-04-catalog).
- OCR de PDFs/fotos.
- Sincronización bidireccional Excel ↔ ChefOS.
- Mapping bulk post-import de productos/unidades (sprint-04-catalog).
- Tests E2E con upload real (deferred — requiere fixture xlsx en repo).

---

## Formato Excel

Hoja **`Recetas`**:

| Columna         | Required | Tipo    | Notas                                                            |
| --------------- | -------- | ------- | ---------------------------------------------------------------- |
| nombre          | sí       | texto   | Único dentro del Excel (case-insensitive trim)                   |
| categoria       | sí       | enum    | starter, main, dessert, sauce, side, drink, bread, pastry, other |
| servings        | sí       | int > 0 | Pax base                                                         |
| descripcion     | no       | texto   |                                                                  |
| tiempo_prep     | no       | int min |                                                                  |
| tiempo_coccion  | no       | int min |                                                                  |
| precio_objetivo | no       | decimal | EUR                                                              |
| alergenos       | no       | CSV     | "gluten, lactosa, frutos_secos"                                  |
| tags            | no       | CSV     | "vegano, sin_gluten"                                             |

Hoja **`Ingredientes`**:

| Columna        | Required | Tipo          | Notas                                       |
| -------------- | -------- | ------------- | ------------------------------------------- |
| receta_nombre  | sí       | texto         | FK a Recetas.nombre (case-insensitive trim) |
| ingrediente    | sí       | texto         |                                             |
| cantidad_bruta | sí       | decimal>0     |                                             |
| unidad         | no       | texto         | Sin lookup en sprint-03c (queda en notas)   |
| merma_pct      | no       | decimal 0-100 |                                             |
| coste_unitario | no       | decimal≥0     | EUR                                         |
| notas          | no       | texto         |                                             |

---

## Archivos críticos

### Crear

```
supabase/migrations/00054_sprint03c_import.sql
src/features/import/
  domain/types.ts
  domain/errors.ts
  domain/invariants.ts
  domain/invariants.test.ts
  domain/schemas.test.ts
  application/parse-excel.ts
  application/parse-excel.test.ts
  application/schemas.ts
  application/upload-and-validate-action.ts
  application/use-import-recipes.ts
  application/use-import-runs.ts
  infrastructure/import-queries.ts
  components/import-recipes-form.tsx
  components/import-preview-table.tsx
  components/import-result-summary.tsx
  components/template-download-button.tsx
  server.ts
  index.ts
src/app/(app)/recipes/import/page.tsx
src/app/api/import/template/recipes/route.ts
```

### Modificar

```
src/app/(app)/recipes/page.tsx                 # CTA "Importar desde Excel"
.ai/specs/module-list.md                       # 17 módulos (hecho)
.ai/specs/decisions-log.md                     # ADR-0013 (hecho)
package.json                                   # + exceljs
README.md                                      # capability matrix
CHANGELOG.md
```

---

## Orden de ejecución

1. **chore(specs)**: ADR-0013 + sprint-03c real + module-list 17 módulos.
2. **feat(db)**: migración 00054 (tabla import_runs + RPC import_recipes_bulk).
3. **chore(deps)**: install exceljs + scaffolding del módulo (domain).
4. **feat(import)**: application layer (parse + schemas + server action + hooks).
5. **feat(import)**: infrastructure (RPC wrapper + fetchImportRuns).
6. **feat(import)**: components (form + preview + result + template button).
7. **feat(app)**: ruta `/recipes/import` + CTA en `/recipes`.
8. **feat(api)**: endpoint `/api/import/template/recipes`.
9. **test**: tests unit parser + schemas + invariants.
10. **docs**: README + CHANGELOG + commit final + push + PR.

---

## Verificación pre-PR

- `npm run typecheck` — 0 errores.
- `npm run lint` — 0 warnings (incluyendo boundaries ESLint).
- `npm run test` — todos verdes, coverage ≥90% en `import/domain` y `import/application`.
- `npm run build` — rutas nuevas compilan.
- Manual:
  - Subir fixture xlsx con 5 recetas (3 válidas, 2 inválidas) → preview correcto, contador "3 OK / 2 errores", botón confirmar habilitado, post-confirm muestra resumen + CSV errores descargable.
  - Descargar template `/api/import/template/recipes`, abrir en Excel, rellenar 1 receta, subir, verificar import.
  - En `/recipes` aparece CTA "Importar desde Excel".
  - Las recetas importadas aparecen en estado `draft` con flag mapping pendiente en ingredientes.

---

## Estado de esta especificación

Sprint en ejecución (2026-04-22). Cierre cuando los 10 commits del orden estén pusheados, tests verdes y verificación manual completada.
