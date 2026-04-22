---
name: design-system-rollout
description: Plan en 5 fases para aplicar Industrial Control Surface a todas las pantallas. Incluye checklist de regresión y mappings *_STATUS_VARIANT.
---

## Base obligatoria

Antes de usar esta skill, confirmar:

- `.ai/specs/design-tokens.md` — tokens oficiales (todas las clases utility y tokens `--co-*`)
- `.ai/checklists/ui-design-checklist.md` — checklist por pantalla (responsive, loading, empty, error, a11y)
- `src/app/design-system/page.tsx` existe como referencia viva (F1 del rollout)

---

## Principios

1. **Tokens en `globals.css`, clases de utilidad reutilizables.** Ningún componente hard-codea colores ni fuentes.
2. **Left-border 3px como única señal de estado.** Sin columnas de estado con bg completo. Badges complementan, no sustituyen.
3. **Tipografía especializada por rol:**
   - Syne → títulos h1-h4 globalmente
   - DM Sans → body, UI, formularios (default)
   - DM Mono → números dominantes (KPI, precios, cantidades)
   - JetBrains Mono → IDs, lotes, albaranes, badges
4. **Accent `#e8e4dc` EXCLUSIVAMENTE en CTA primario y nav activo.**
5. **Migración no-destructiva.** Los mappings legacy se conservan hasta que el módulo se cierre. Se añaden `*_STATUS_VARIANT` paralelos que mapean a `neutral | info | success | warning | urgent`.

---

## Building blocks disponibles

| Clase | Uso |
|---|---|
| `.kpi-value` | Número KPI dominante (DM Mono 32px, tabular-nums) |
| `.kpi-label` | Etiqueta KPI (JetBrains Mono 11px uppercase, letter-spacing 0.08em) |
| `.co-badge` | Badge 11px uppercase con bg+border tonal |
| `.co-status-rail` + variante | Left-border 3px en `<tr>`, cards, command cards |
| `.co-alert-box` + variante | Bg entera tintada + border-left + title FG |
| `.font-display` / `.font-body-v2` / `.font-data` / `.font-code` | Helpers tipográficos |

Todos los tokens viven en `src/app/globals.css` con prefijo `--co-*`.

---

## Fases del rollout

### F0 — Tokens + fuentes (fundación)

- [ ] `@theme` en `globals.css` con tokens `--co-*` de `design-tokens.md`
- [ ] Google Fonts en `<head>` de `layout.tsx`: Syne + DM Sans + DM Mono + JetBrains Mono
- [ ] `body { font-family: DM Sans; font-size: 110% }` (17.6px escalable)
- [ ] `h1-h4 { font-family: Syne }` global
- [ ] Utility classes publicadas (`.kpi-value`, `.kpi-label`, `.co-badge`, `.co-status-rail`, `.co-alert-box`)
- [ ] Contraste: `.bg-accent` auto asigna `color: var(--co-accent-fg)`

### F1 — Referencia viva

- [ ] `src/app/design-system/page.tsx` — showcase 1:1 del DS con hero, tipografía, color, botones, alertas, banda de mando, tablas, fichas
- Sirve como regresión visual + referencia para crear nuevas pantallas

### F2 — Shell + dashboard

- [ ] Sidebar: 56px colapsado / 200px expandido
- [ ] Dashboard: banda de mando (turno · servicio · siguiente acción) con `co-status-rail` encima del grid KPIs
- [ ] KPI cards usan `.kpi-value` + `.kpi-label`
- [ ] Badges en "eventos de hoy" usan `.co-badge`

### F3 — Tablas operativas + purga light-mode

Patrón por tabla:

- `h1` tag (Syne 28px automático)
- `<thead>` con JetBrains Mono 10px + `border-color: --co-border-strong`
- `<tr>` con `.co-status-rail {variant}` según estado
- Columnas numéricas en `.font-data` + `text-right`
- IDs/códigos en `.font-code`
- Columna "Estado" con `.co-badge {variant}`
- KPI cards de cabecera con `.kpi-value` + `.kpi-label`

Purga:

- [ ] Eliminar clases light-mode residuales (`bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`, colores `*-600`)
- [ ] Barrido `sed` por `src/app/(dashboard)/` para detectar residuales

### F4 — Status-rail en pantallas pendientes + radios globales

Nuevos mappings necesarios (cuando aparezcan):

- `COUNT_STATUS_VARIANT` (inventory counts)
- `SUGGESTION_STATUS_VARIANT` (agents)
- `INTEGRATION_STATUS_VARIANT` + `SYNC_VARIANT` (integrations)
- `JOB_STATUS_VARIANT` (automation)
- `SCHEDULE_STATUS_VARIANT` (hr)
- `APPCC_STATUS_VARIANT` (compliance)

Ubicación del mapping: en el `types.ts` del feature correspondiente, no inline.

Radios globales:

- [ ] `rounded-2xl` → `rounded-lg` (10px modales)
- [ ] `rounded-xl` → `rounded-md` (8px cards/botones)
- [ ] `focus:ring-accent/40` o `/90` → `focus:ring-accent`

Tokens inexistentes eliminados:

- [ ] `bg-background` (shadcn legacy) → `bg-co-surface`
- [ ] `bg-surface-alt` → `bg-co-surface-2`

### F5 — Polish

- [ ] `.skeleton` con `@keyframes pulse` propio
- [ ] `.empty-state`, `.empty-state-title`, `.empty-state-hint`
- [ ] Focus ring global sobre `button`, `a`, `[role="button"]`
- [ ] `notification-bell` skeleton migrado a `.skeleton`
- [ ] Dashboard con `OperationalFeed` (feed vertical de left-border rails sustituyendo el "Alerts row")

---

## Checklist de regresión por pantalla migrada

Para cada pantalla tocada:

1. `preview_inspect` sobre `<h1>` → `font-family: Syne`, `font-size: 28px`
2. `preview_inspect` sobre primer `<tr class="co-status-rail ...">` → `border-left-width: 3px` + color del variant
3. `preview_inspect` sobre primer `.co-badge` → `font-family: JetBrains Mono`, uppercase, padding `2px 8px`
4. `preview_console_logs level=error` → 0
5. `npm run typecheck && npm run lint` → 0 errores

---

## Criterios para dar una fase por cerrada

- 100% de pantallas listadas migradas
- `npm run typecheck` pasa limpio
- 0 warnings nuevos en lint
- Tests existentes siguen en verde
- Screenshot de pantallas representativas coincide estéticamente con `/design-system`

---

## Alcance de esta skill

Cubre:

- plan secuencial de aplicación del DS
- mappings de status variant por módulo
- checklist de regresión visual + funcional
- criterios de cierre

NO cubre:

- decisiones sobre el propio DS (eso vive en `design-tokens.md`)
- onboarding de nuevos componentes shadcn (requiere ADR — `decisions-log.md` ADR-0002)

---

## Relación con otros documentos

- `/.ai/specs/design-tokens.md`
- `/.ai/checklists/ui-design-checklist.md`
- `/.ai/prompts/design-cookbook.prompt.md`
- `/.ai/specs/decisions-log.md` (ADR-0002 librerías UI)
