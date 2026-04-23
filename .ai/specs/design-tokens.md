# ChefOS v3 Design Tokens

## Objetivo

Este documento define los tokens oficiales del design system de ChefOS v3 — el "Industrial Control Surface" validado en v2.

Su propósito es evitar:

- valores mágicos en el código
- divergencia entre módulos
- tokens improvisados por pantalla
- reintroducción de estéticas genéricas (shadcn default, glassmorphism, gradientes)
- pérdida de cumplimiento WCAG AA

Este documento es normativo.

---

## Principios

1. El color es estado, no decoración.
2. La tipografía hace el trabajo visual.
3. Dark-first como diferenciación funcional en cocinas profesionales.
4. Todos los tokens pasan WCAG 2.1 AA (4.5:1 mínimo en texto).
5. Sin gradientes, sin glassmorphism, sin sombras llamativas, sin emojis.
6. Los tokens evolucionan por ADR, no por capricho de módulo.

---

## Tipografía

### Stack oficial

| Rol               | Fuente             | Peso    | Uso                                                |
| ----------------- | ------------------ | ------- | -------------------------------------------------- |
| Display / Módulos | **Syne**           | 600–700 | Títulos de página, nombres de módulo, hero         |
| Body / UI         | **DM Sans**        | 400–500 | Párrafos, formularios, labels, nav, botones        |
| Datos / Números   | **DM Mono**        | 400–500 | KPIs, cantidades, precios, porcentajes, timestamps |
| Códigos / Status  | **JetBrains Mono** | 400–500 | Lote IDs, refs proveedor, APPCC IDs, badges estado |

### Carga (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

### Escala

| Nivel   | Fuente         | Tamaño                    | Peso    | Uso                       |
| ------- | -------------- | ------------------------- | ------- | ------------------------- |
| Display | Syne           | 36–48px                   | 700     | Hero del módulo           |
| H1      | Syne           | 28px                      | 700     | Título de página          |
| H2      | Syne           | 22px                      | 600     | Sección, nombre evento    |
| H3      | Syne           | 17px                      | 600     | Título de card            |
| Body    | DM Sans        | **17.6px** (110% de 16px) | 400     | Texto base                |
| Body SM | DM Sans        | 14px                      | 400     | Captions, metadata        |
| Label   | DM Sans        | 13px                      | 500     | Form labels, th           |
| KPI     | DM Mono        | 28–40px                   | 500     | Números dominantes        |
| Data    | DM Mono        | 13–15px                   | 400     | Valores de tabla, precios |
| Code    | JetBrains Mono | 11–13px                   | 400–500 | IDs, badges, audit        |

### Reglas

- Los números son el héroe: mínimo 28px en KPIs, etiqueta debajo en 11px `text-muted`.
- Uppercase solo en metadata (`letter-spacing: 0.08em`), nunca en nav completo.
- `DM Mono` activa `font-variant-numeric: tabular-nums` en tablas.
- Columnas numéricas siempre `text-align: right`.
- Body 110% (17.6px) escala con `Ctrl+/-` (no hard-code px).

---

## Color

### Enfoque: Restrained — el color es estado

```css
:root {
  /* Superficies */
  --co-bg: #1a1a1a;
  --co-surface: #242424;
  --co-surface-2: #1e1e1e; /* sidebar, command band */
  --co-surface-3: #2a2a2a; /* hover, selected */
  --co-border: #2e2e2e;
  --co-border-strong: #3a3a3a;

  /* Texto (WCAG AA sobre bg-card #242424) */
  --co-text-primary: #d4d4d4; /* 9.9:1 */
  --co-text-secondary: #a0a0a0; /* 5.8:1 */
  --co-text-muted: #949494; /* 4.8:1 */

  /* Accent — SOLO CTA primario y nav activo */
  --co-accent: #e8e4dc; /* Tungsten White */
  --co-accent-fg: #1a1a1a;

  /* Estado — base SATURADO (solo bg-/border-) */
  --co-urgent: #c0392b;
  --co-urgent-bg: rgba(192, 57, 43, 0.12);
  --co-urgent-border: rgba(192, 57, 43, 0.25);

  --co-warning: #b87333; /* cobre, no amber */
  --co-warning-bg: rgba(184, 115, 51, 0.12);
  --co-warning-border: rgba(184, 115, 51, 0.25);

  --co-success: #5a7a5a; /* desaturado intencionalmente */
  --co-success-bg: rgba(90, 122, 90, 0.12);
  --co-success-border: rgba(90, 122, 90, 0.25);

  --co-info: #4a6070;
  --co-info-bg: rgba(74, 96, 112, 0.12);
  --co-info-border: rgba(74, 96, 112, 0.25);

  /* Foregrounds CLAROS para texto de estado (WCAG AA sobre bg-card) */
  --co-success-fg: #8baf8b; /* 5.5:1 */
  --co-warning-fg: #d4a574; /* 5.7:1 */
  --co-danger-fg: #e88070; /* 5.2:1 */
  --co-info-fg: #8ba6b8; /* 5.3:1 */

  --co-focus-ring: #e8e4dc;
}
```

### Data viz (5 colores desaturados)

```css
--co-chart-food-cost: #6b8fa3;
--co-chart-stock: #8fa36b;
--co-chart-spend: #a38b6b;
--co-chart-waste: #8b6ba3;
--co-chart-alerts: #a36b6b;
```

### Reglas críticas

- `--co-accent` nunca se usa en texto secundario, decoración ni bordes genéricos. Solo: botón primario + nav activo + focus ring.
- Tokens base `--co-{success|warning|danger|info}` son **saturados** → solo `bg-*/10` y `border-*`.
- Para texto de estado usar los `*-fg` (claros) → cumplen WCAG AA.
- Sin botones llamativos: CTA primario se lee por contraste, escala y posición.
- Sombras casi inexistentes (máx `box-shadow: 0 1px 3px rgba(0,0,0,0.3)`).

---

## Patrones de estado

### `.co-alert-box` — bg entera tintada

Para mensajes que requieren atención (alertas, sugerencias agente, banners acción).

```css
.co-alert-box {
  border-left: 3px solid var(--co-border);
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
}
.co-alert-box.urgent {
  background: var(--co-urgent-bg);
  border-left-color: var(--co-urgent);
}
.co-alert-box.warning {
  background: var(--co-warning-bg);
  border-left-color: var(--co-warning);
}
.co-alert-box.success {
  background: var(--co-success-bg);
  border-left-color: var(--co-success);
}
.co-alert-box.info {
  background: var(--co-info-bg);
  border-left-color: var(--co-info);
}

.co-alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}
.co-alert-box.urgent .co-alert-title {
  color: var(--co-danger-fg);
}
.co-alert-box.warning .co-alert-title {
  color: var(--co-warning-fg);
}
.co-alert-box.success .co-alert-title {
  color: var(--co-success-fg);
}
.co-alert-box.info .co-alert-title {
  color: var(--co-info-fg);
}
```

### `.co-status-rail` — solo border-left 3px

Para estado de trabajo o contexto (banda de mando, KPI cards summary, integraciones).

```css
.co-status-rail {
  border-left: 3px solid var(--co-border);
  border-radius: 0 8px 8px 0;
}
.co-status-rail.urgent {
  border-left-color: var(--co-urgent);
}
.co-status-rail.warning {
  border-left-color: var(--co-warning);
}
.co-status-rail.success {
  border-left-color: var(--co-success);
}
.co-status-rail.info {
  border-left-color: var(--co-info);
}

/* Rows <tr> urgent/warning tintan automáticamente */
tbody tr.co-status-rail.urgent {
  background: var(--co-urgent-bg);
}
tbody tr.co-status-rail.warning {
  background: var(--co-warning-bg);
}
```

---

## Spacing

Base: 4px. Densidad compacta por defecto.

| Token      | Valor | Uso                          |
| ---------- | ----- | ---------------------------- |
| `space-1`  | 4px   | gaps internos mínimos        |
| `space-2`  | 8px   | padding badge, gap icono     |
| `space-3`  | 12px  | padding tabla (compact)      |
| `space-4`  | 16px  | padding card, gap form group |
| `space-5`  | 20px  | padding sección interior     |
| `space-6`  | 24px  | padding layout principal     |
| `space-8`  | 32px  | separación secciones         |
| `space-12` | 48px  | separación bloques grandes   |
| `space-16` | 64px  | margen página                |

---

## Radios

- `4px` — tablas, inputs compactos
- `8px` — cards, botones
- `10px` — modales, panels grandes

Nunca más de 10px en componentes de producto.

---

## Layout

- Sidebar: 56px colapsado / 200px expandido. Icon-led. Sin texto completo en nav por defecto.
- Main content max-width: 1280px.
- Grid principal: `8/4` o `9/3` (nunca columnas iguales para datos operativos).

### Dashboard composition

```
┌─────────────────────────────────────────────────────────┐
│  BANDA DE MANDO (command band) — top 35%                 │
│  Turno · Servicio · Bloqueadores · Siguiente acción      │
├─────────────────────────┬───────────────────────────────┤
│  KPIs operativos (8/12) │  Alertas + aprobaciones (4/12)│
├─────────────────────────┴───────────────────────────────┤
│  Tabla / lista / kanban de prioridad                     │
└─────────────────────────────────────────────────────────┘
```

Reglas:

- Banda horizontal primero, cards después.
- Preferir tablas largas / timelines / kanban sobre mosaicos de KPIs.
- Cada pantalla necesita un "anchor panel" legible desde 3 metros.

---

## Componentes (resumen de patrones)

### Botón

```
Primario:    bg #e8e4dc, text #1a1a1a
Secundario:  bg transparent, text #d4d4d4, border #3a3a3a
Ghost:       bg transparent, text #a0a0a0
Destructivo: bg urgent-bg, text #e88070, border urgent-border
```

Padding: `8px 16px` (md), `6px 12px` (sm), `10px 20px` (lg).

### Badge

```
font: JetBrains Mono 11px 500
letter-spacing: 0.06em
text-transform: uppercase
padding: 2px 8px
border-radius: 4px
```

Siempre **complementa** el left-border, nunca lo sustituye.

### Input

- bg: `--co-surface-2` (más oscuro que la card)
- border: `--co-border`, focus `--co-accent`
- label: 13px, 500, `--co-text-secondary`
- error: border `--co-urgent` + mensaje abajo en `--co-danger-fg`

### Tabla

- thead: bg `--co-surface-2`, border-bottom `--co-border-strong`
- th: JetBrains Mono 10px uppercase, letter-spacing 0.08em, `--co-text-muted`
- td: DM Sans 14px, `--co-text-primary`
- números: DM Mono 13px, right-align, tabular-nums
- row padding: `10px 16px`
- filas con estado: `border-left: 3px` en `<tr>`

### Iconos

- Lucide icons base
- 16px nav / 18px botones / 20px acciones standalone
- Sin emojis en UI

---

## Motion

- Minimal-functional. Sin entrance animations decorativas.
- Easing: enter `ease-out` · exit `ease-in` · move `ease-in-out`
- Duraciones: `micro` 60ms · `short` 150ms · `medium` 250ms · `long` 400ms (evitar)

---

## Accesibilidad WCAG 2.1 AA

- Texto ≥ 4.5:1 sobre bg (los tokens ya lo cumplen).
- `html { font-size: 110% }` para escalar con `Ctrl+/-`.
- Skip link `<a href="#main-content" class="sr-only focus:not-sr-only...">` primer focusable.
- `<title>` con template `%s — ChefOS` en root layout. Client components usan `useDocumentTitle()`.
- Headings h1→h2→h3 sin saltos.
- `<label>` asociado a todos los inputs.
- `aria-label` en iconos-botón sin texto.
- Focus ring: `outline: 2px solid var(--co-focus-ring)` en interactivos.

---

## Anti-patterns

- Sin gradientes
- Sin glassmorphism ni frosted panels
- Sin glow borders
- Sin centered hero en app views
- Sin mosaico de KPI cards de igual peso
- Sin radius > 10px en componentes de producto
- Sin ilustraciones decorativas
- Sin icon grids + texto (patrón marketing) en product UI
- Sin estados success en azul/teal
- Sin emojis
- Sin sombras llamativas

---

## Ampliación

Añadir un token nuevo requiere:

1. Justificación en `decisions-log.md` como ADR.
2. Validación WCAG AA si es color de texto o interactivo.
3. Integración en este documento.
4. Actualización del skill `design-system-rollout/` si afecta migración.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/core-constraints.md`
- `/.ai/checklists/ui-design-checklist.md`
- `/.ai/prompts/design-cookbook.prompt.md`
- `/.ai/skills/design-system-rollout/`

---

## Estado de esta especificación

Este documento define los tokens oficiales del design system de ChefOS v3.

Todo componente, pantalla o módulo debe consumir estos tokens, nunca valores mágicos.
