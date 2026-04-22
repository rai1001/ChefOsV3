# UI Design Checklist — ChefOS v3

> Checklist obligatoria **por pantalla** antes de dar por cerrada una tarea de UI.

Referencia: [`specs/design-tokens.md`](../specs/design-tokens.md), [`specs/core-constraints.md`](../specs/core-constraints.md).

---

## 1. Responsive

- [ ] Desktop (1280px+) — layout principal funcional
- [ ] Tablet (768-1279px) — sidebar colapsado, grid 12 → 8, sin scroll horizontal
- [ ] Móvil (<768px) — sidebar convertido en bottom nav o hamburger, cards apiladas
- [ ] Touch targets ≥44×44px en móvil (botones, inputs, checkboxes)

## 2. Estados de la vista

- [ ] **Loading**: skeleton visible con clase `.skeleton` (no `animate-pulse` suelto)
- [ ] **Empty**: mensaje claro + icono Lucide + CTA (crear, importar, ver tutorial)
- [ ] **Error**: toast o alert-box + acción de retry + no stack traces al usuario
- [ ] **Éxito silencioso**: confirmación mínima (toast corto, badge verde), sin celebración excesiva

## 3. Tipografía

- [ ] H1 usa Syne 28px peso 700 (automático si usas `<h1>`)
- [ ] H2 usa Syne 22px peso 600
- [ ] Body usa DM Sans 17.6px (base escalable con Ctrl+/-)
- [ ] Números dominantes (KPIs, precios, cantidades) usan DM Mono con tabular-nums
- [ ] IDs, lotes, albaranes, badges usan JetBrains Mono

## 4. Color y estado

- [ ] Tokens `--co-*` consumidos, no colores hard-coded
- [ ] Sin clases light-mode residuales (`bg-white`, `bg-gray-*`, `text-gray-*`)
- [ ] Estado mostrado con `co-status-rail` (left-border 3px) — NO con `<td>` de bg completo
- [ ] `--co-accent` solo en CTA primario y nav activo
- [ ] Mensajes de atención usan `co-alert-box`, estado contextual usa `co-status-rail`
- [ ] `*_STATUS_VARIANT` mapping existe en `features/<feature>/domain/types.ts`

## 5. Accesibilidad WCAG 2.1 AA

- [ ] Todos los `<input>` tienen `<label>` asociado
- [ ] Iconos-botón sin texto visible tienen `aria-label`
- [ ] Focus ring visible en interactivos (`outline: 2px solid var(--co-focus-ring)`)
- [ ] Contraste texto ≥ 4.5:1 (tokens `--co-*` lo garantizan, verificar si hay custom)
- [ ] Página tiene título (`<title>` o `useDocumentTitle()`)
- [ ] Jerarquía de headings h1 → h2 → h3 sin saltos
- [ ] Skip link presente si hay sidebar/topbar

## 6. Performance y datos

- [ ] Data fetching con TanStack Query (no `useEffect + fetch` manual)
- [ ] Skeletons mientras carga — no pantallas en blanco
- [ ] Paginación si lista >50 items (o virtual scroll)
- [ ] Memoización de listas grandes si aplica

## 7. Lógica de negocio (reglas duras)

- [ ] **Cero acceso directo a Supabase** desde el componente (`supabase.from`, `supabase.rpc`)
- [ ] Toda data viene de hooks en `features/<feature>/application/`
- [ ] Mutaciones vía hooks, no inline en componente
- [ ] Guards de permisos aplicados (el usuario no ve acciones que no puede ejecutar)

## 8. Radios y spacing

- [ ] `rounded-sm` (4px) en tablas/inputs
- [ ] `rounded-md` (8px) en cards y botones
- [ ] `rounded-lg` (10px) en modales
- [ ] NO `rounded-xl` ni `rounded-2xl`
- [ ] Spacing consistente con escala de 4px base

## 9. Anti-patterns

- [ ] Sin gradientes
- [ ] Sin glassmorphism
- [ ] Sin glow
- [ ] Sin centered hero en app views
- [ ] Sin icon grids con texto debajo (patrón marketing)
- [ ] Sin emojis
- [ ] Sin shadows llamativas (máx `0 1px 3px rgba(0,0,0,0.3)`)

## 10. Regresión con `/design-system`

- [ ] Screenshot de la pantalla coincide estéticamente con `src/app/design-system/page.tsx`
- [ ] Botones, badges, tablas, cards se ven idénticos a la referencia viva

## 11. Testing (si toca UI compleja)

- [ ] Test unitario de renderizado básico
- [ ] Test de interacción si hay formularios o CTA clave
- [ ] Test de permisos si la vista cambia según rol
- [ ] E2E si forma parte de un flujo crítico del módulo

---

## Cómo usar

Antes de marcar tarea done, revisar todos los checkboxes. Si alguno crítico no se cumple:

- Arreglar antes de PR
- Si no se puede arreglar ahora, documentar en PR como "known issue" + issue follow-up

Si el cambio es trivial (un botón, un label), subset razonable: tipografía + tokens + accesibilidad básica + regresión.

---

## Relación con otros documentos

- `/.ai/specs/design-tokens.md` — tokens oficiales
- `/.ai/prompts/design-cookbook.prompt.md` — recetas copy-paste
- `/.ai/skills/design-system-rollout/` — plan de aplicación progresiva
- `/.ai/specs/definition-of-done.md` — criterio general de cierre
