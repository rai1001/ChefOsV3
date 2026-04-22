# Stitch UI Reference — ChefOS v3

> Guía de uso del material de referencia Stitch (HTMLs + ZIPs) como insumo visual para implementar UI.

---

## Fuente

Carpeta local (no versionada si es zip grande):
- `docs/ui-reference/stitch/` — zip + carpeta descomprimida

Si no existe la carpeta descomprimida, este prompt se usa como guía general.

---

## Cómo consumir una pantalla Stitch

### Paso 1 — Localizar el HTML

```
docs/ui-reference/stitch/**/screen.html
```

Buscar con Glob o grep por:

- nombre del módulo (ej. `dashboard`, `table`, `login`)
- palabras clave del patrón (ej. `kanban`, `calendar`, `form`)

### Paso 2 — Evaluar encaje

Antes de copiar, decidir:

1. ¿El patrón es dark? (debe serlo para ChefOS)
2. ¿Las proporciones cuadran con viewport de cocina (1280px max)?
3. ¿El patrón respeta densidad compacta o es un hero marketing?

Si el patrón no encaja → descartar y mapear manualmente al DS (ver `design-cookbook.prompt.md`).

### Paso 3 — Convertir a React + Tailwind

**No copiar HTML tal cual.** Proceso:

1. Extraer la **estructura semántica** (layout, jerarquía de secciones).
2. Ignorar los **estilos de Stitch** (colores, fuentes, radios).
3. Aplicar los tokens `--co-*` y clases utility del DS v3.
4. Re-tipar con los 4 font families del DS.
5. Sustituir los iconos Stitch por Lucide icons.

### Paso 4 — Si no hay HTML disponible

Replicar el patrón con componentes en `src/components/` (ui base) más las recetas de `design-cookbook.prompt.md`.

---

## Lo que SÍ se toma de Stitch

- Layout general (grid, proporciones de columnas)
- Estructura de información (qué va arriba, qué en sidebar, qué en footer)
- Jerarquía de interacción (CTA principal, acciones secundarias)
- Densidad de espaciado (compacta / respirada)

## Lo que NO se toma de Stitch

- Paleta de colores
- Tipografía
- Border-radius
- Sombras y efectos visuales
- Iconografía custom
- Animaciones / transitions específicas

---

## Flujo típico

```
1. Tengo pantalla en ChefOS a diseñar (ej. "vista de forensics inventario")
2. Consulto prompts/stitch-screen-mapping.prompt.md → sugiere "Timeline / lineage graph"
3. Busco en docs/ui-reference/stitch/ un ejemplo de timeline dark
4. Extraigo estructura
5. Convierto a React con tokens --co-*
6. Aplico design-cookbook.prompt.md para KPI cards, tablas, badges
7. Verifico con ui-design-checklist.md
8. Revisión visual contra /design-system/page.tsx
```

---

## Si no se dispone de material Stitch

El design system tiene suficientes recetas propias. Usar:

- `src/app/design-system/page.tsx` (showcase completo)
- `prompts/design-cookbook.prompt.md` (recetas)
- `specs/design-tokens.md` (tokens)

No es bloqueante disponer de Stitch — es aceleración visual, no requisito.

---

## Referencia

Consultar junto a `prompts/stitch-screen-mapping.prompt.md` y `prompts/design-cookbook.prompt.md`.
