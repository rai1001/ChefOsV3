# Stitch Screen Mapping — ChefOS v3

> Mapeo rápido de pantallas ChefOS → patrón Stitch más cercano, para usar Stitch como referencia visual al implementar UI.

---

## Tabla de mapeo

| ChefOS pantalla | Patrón Stitch recomendado |
|---|---|
| Login / forgot-password / reset-password | Login screen (dark) |
| Onboarding (wizard) | Multi-step form layout |
| Dashboard | Dashboard cards + table (con banda de mando arriba) |
| Eventos (listado) | Table + filters + toolbar |
| Eventos (detalle) | Form layout + side panel (BEO preview) |
| Recetas (listado) | Table + filters |
| Recetas (detalle + escandallo) | Form layout + summary panel lateral |
| Productos / Proveedores | Table + filters + toolbar |
| Compras — PRs / POs / GRs | Table tabs + detail panel |
| Compras — OCR review | Card list + drag-reorder + dropdown |
| Inventario (listado) | Table + filters + KPI top |
| Inventario — counts | Multi-step form (sesión → entry → review) |
| Inventario — forensics | Timeline / lineage graph |
| Producción — plan | Kanban + side detail |
| Producción — mise en place | Card list con checklists |
| Producción — KDS | Grid de cards (kitchen orders) |
| Producción — shopping list | Table con quantities y estado |
| Compliance — APPCC | Table con drawer modal |
| Compliance — temperaturas | Log list con chart |
| Compliance — etiquetado | Card list + QR preview |
| Compliance — trazabilidad | Timeline / tree lineage |
| Reporting / Dashboard | Dashboard cards + charts + tables |
| Alertas | Feed vertical de left-border alerts |
| HR — personnel / shifts / schedule | Table + calendar view |
| Integrations settings | Cards con toggles + form |
| Automation jobs | Table con status badges |
| Agentes — sugerencias | Card list con approve/reject |
| Agentes — config | Form per agent |
| Settings (team, integrations, notif) | Tabs + form |
| Mobile — mis tareas del día | Card list + primary CTA grande |

---

## Regla de elección

Cuando hay varios ejemplos Stitch que encajan:

1. Elegir el más cercano a **dark premium** (ChefOS es dark-first).
2. Reusar tokens `--co-*` del design system (no copiar colores de Stitch).
3. Sustituir tipografías de Stitch por las del DS (Syne / DM Sans / DM Mono / JetBrains).
4. Respetar el **left-border status system** — si el patrón Stitch usa columna de estado con bg, migrarlo a left-border 3px en el `<tr>`.

---

## Adaptación obligatoria al DS

Un patrón Stitch NUNCA entra tal cual. Siempre se adapta:

| Stitch default | ChefOS v3 |
|---|---|
| Colores variados / vibrantes | Solo estado: `urgent / warning / success / info / neutral` |
| Border-radius grande (16-24px) | 4/8/10px según componente |
| Gradientes / glassmorphism | Prohibido |
| Iconos con texto debajo en grid | Prohibido en product UI |
| Sombras amplias | Máximo `0 1px 3px rgba(0,0,0,0.3)` |
| Tipografía single-font | Stack 4 fuentes (Syne/DM Sans/DM Mono/JetBrains) |

---

## Referencia

Consultar junto a `prompts/stitch-ui-reference.prompt.md` (cómo usar los HTMLs de Stitch) y `prompts/design-cookbook.prompt.md` (patrones concretos).
