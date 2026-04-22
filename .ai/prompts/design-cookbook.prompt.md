# Design Cookbook — ChefOS v3

> Recetas copy-paste para extender el design system sin reinventar patrones.
> Spec: [`specs/design-tokens.md`](../specs/design-tokens.md). Rollout: [`skills/design-system-rollout/`](../skills/design-system-rollout/).

---

## Receta 1 — Añadir pantalla con tabla de estado

**Caso**: listar registros con columna de estado.

1. Copia como base una pantalla ya migrada (ver `src/app/design-system/page.tsx` como referencia viva).

2. Patrón del `<thead>`:

```tsx
<thead>
  <tr
    className="border-b text-left"
    style={{
      borderColor: 'var(--co-border-strong)',
      color: 'var(--co-text-muted)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '10px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}
  >
    <th className="px-4 py-3 font-medium">Nombre</th>
    <th className="px-4 py-3 text-right font-medium">Cantidad</th>
    <th className="px-4 py-3 font-medium">Estado</th>
  </tr>
</thead>
```

3. `<tr>` con `co-status-rail` + variante:

```tsx
<tr
  key={row.id}
  className={cn(
    'co-status-rail border-b last:border-0 hover:bg-zinc-900/50',
    X_STATUS_VARIANT[row.status]
  )}
>
  <td className="px-4 py-3 text-sm">{row.name}</td>
  <td className="px-4 py-3 text-sm font-data text-right">
    {row.amount.toFixed(2)}
  </td>
  <td className="px-4 py-3">
    <span className={cn('co-badge', X_STATUS_VARIANT[row.status])}>
      {X_STATUS_LABELS[row.status]}
    </span>
  </td>
</tr>
```

**Reglas**:
- Left-border rail en el `<tr>`, NO en el `<td>`.
- Números siempre a la derecha + `font-data` (DM Mono tabular-nums).
- IDs (lotes, albaranes, BEO) con `font-code` (JetBrains Mono).
- Columna Estado con `co-badge` + la misma variante que el rail.

---

## Receta 2 — Añadir enum de estado nuevo

**Caso**: feature nueva con sus propios estados (ej. `tasting_session_status`).

1. Define el enum en `src/features/<feature>/domain/types.ts`:

```ts
export const TASTING_SESSION_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const
export type TastingSessionStatus = (typeof TASTING_SESSION_STATUSES)[number]

export const TASTING_SESSION_STATUS_LABELS: Record<TastingSessionStatus, string> = {
  scheduled: 'Programada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}
```

2. Añade el mapping `*_STATUS_VARIANT`:

```ts
export const TASTING_SESSION_STATUS_VARIANT: Record<
  TastingSessionStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'urgent'
> = {
  scheduled:   'info',
  in_progress: 'warning',
  completed:   'success',
  cancelled:   'urgent',
}
```

3. Exporta vía `src/features/<feature>/index.ts`.

4. Consume en UI (Receta 1).

**Guía de mapeo**:

| Variante | Cuándo |
|---|---|
| `urgent` | Acción inmediata · crítico · cancelado |
| `warning` | Atención · pendiente · progreso con riesgo |
| `info` | Neutro informativo · enviado · consolidado |
| `success` | Confirmado · aprobado · completado OK |
| `neutral` | Sin estado especial · borrador · archivado |

**Nota**: los mappings viven en `domain/types.ts` del feature, **no inline** en componente.

---

## Receta 3 — Añadir KPI card

```tsx
<div className="rounded-md border p-4" style={{ background: 'var(--co-surface)', borderColor: 'var(--co-border)' }}>
  <p className="kpi-label">Productos en stock</p>
  <p className="kpi-value mt-2">{total}</p>
</div>
```

Con rail de estado cuando relevante:

```tsx
<div className={cn(
  'co-status-rail rounded-r-md p-4',
  alertCount > 0 ? 'urgent' : ''
)} style={{ background: 'var(--co-surface)' }}>
  <p className="kpi-label">Alertas</p>
  <p className="kpi-value mt-2">{alertCount}</p>
</div>
```

Tokens usados:
- `kpi-value` — DM Mono 32px tabular-nums
- `kpi-label` — JetBrains Mono 11px uppercase tracking 0.08em

Si el valor es texto corto (ej. "Sin plan"), `kpi-value` también lo renderiza bien.

---

## Receta 4 — Añadir modal

```tsx
{open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div
      className="w-full max-w-lg rounded-lg p-6 shadow-xl space-y-4"
      style={{ background: 'var(--co-surface)' }}
    >
      <h2 className="text-base font-semibold">Título</h2>
      <p className="text-sm" style={{ color: 'var(--co-text-muted)' }}>
        Subtítulo o contexto
      </p>

      {/* contenido */}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-md border py-2 text-sm"
          style={{ borderColor: 'var(--co-border)', color: 'var(--co-text-secondary)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-1 rounded-md py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--co-accent)', color: 'var(--co-accent-fg)' }}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
```

**Reglas**:
- Overlay: `bg-black/60`
- Modal: `rounded-lg` (10px) — NO `rounded-xl` ni `rounded-2xl`
- Primary: `--co-accent` + `--co-accent-fg`
- Padding interior: `p-6`
- Max width: `max-w-lg` (448px) estándar, `max-w-2xl` formularios amplios

---

## Receta 5 — Purgar clases light-mode de código heredado

**Caso**: integraste una página externa (shadcn docs, plantilla) y trae `bg-white`, `bg-gray-*`, `text-gray-*`.

```bash
find src/app -name "*.tsx" -exec sed -i -E \
  -e 's/\bbg-gray-900\b/bg-zinc-950/g' \
  -e 's/\bbg-gray-100\b/bg-zinc-800\/50/g' \
  -e 's/\bbg-gray-50\b/bg-zinc-900/g' \
  -e 's/\bbg-white\b/bg-[var(--co-surface)]/g' \
  -e 's/\btext-gray-900\b/text-[var(--co-text-primary)]/g' \
  -e 's/\btext-gray-600\b/text-[var(--co-text-secondary)]/g' \
  -e 's/\btext-gray-500\b/text-[var(--co-text-muted)]/g' \
  -e 's/\btext-gray-400\b/text-[var(--co-text-muted)]/g' \
  -e 's/\bborder-gray-200\b/border-[var(--co-border)]/g' \
  -e 's/\bborder-gray-300\b/border-[var(--co-border)]/g' \
  -e 's/\btext-green-600\b/text-success-fg/g' \
  -e 's/\btext-yellow-600\b/text-warning-fg/g' \
  -e 's/\btext-red-600\b/text-danger-fg/g' \
  -e 's/\btext-blue-600\b/text-info-fg/g' \
  -e 's/\brounded-2xl\b/rounded-lg/g' \
  -e 's/\brounded-xl\b/rounded-md/g' \
  {} \;
```

Verificación posterior:

```bash
grep -rE "bg-gray-|text-gray-|bg-white\b|border-gray-" src/app --include="*.tsx"
npm run typecheck
npm run lint
```

---

## Receta 6 — Añadir alert-box

**Caso**: mensaje que requiere atención (no solo estado de contexto).

```tsx
<div className="co-alert-box urgent">
  <p className="co-alert-title">Stock crítico</p>
  <p className="text-sm mt-1">
    Pulpo congelado — quedan 2kg. Pedido en curso llega el viernes.
  </p>
</div>
```

Variantes: `urgent | warning | success | info`.

**Diferencia con `.co-status-rail`**:
- `.co-alert-box` → bg entera tintada + FG claro en título → **atención requerida**
- `.co-status-rail` → solo border-left → **contexto de estado**

Regla: si el usuario debe hacer algo por el mensaje, es alert-box. Si solo informa estado, es status-rail.

---

## Anti-patterns

1. **No `text-white` sobre `--co-accent`**. El DS fuerza `color: var(--co-accent-fg)`. Si quieres blanco, usa otro contexto (`bg-danger` está bien).
2. **No custom CSS en componentes.** Añade utility en `globals.css` y documenta aquí.
3. **No gradientes, glassmorphism, glow, sombras llamativas, border-radius > 10px, emojis.** (ver `specs/design-tokens.md` §Anti-patterns)
4. **No estado en `<td>` con bg completo**. Va en left-border del `<tr>` + `.co-badge`.
5. **No `rounded-xl`/`rounded-2xl`.** Solo `rounded-sm` (4px) / `rounded-md` (8px) / `rounded-lg` (10px).

---

## Debugging rápido

| Síntoma | Causa | Fix |
|---|---|---|
| Botón accent con texto invisible | `text-white` sobre `--co-accent` | Usar `color: var(--co-accent-fg)` |
| `co-status-rail` no se ve | Falta variante o el `<tr>` no tiene `border-left` | DevTools: debe haber `border-left-width: 3px` |
| `co-badge` sin estilo | Typo en variante | Válidas: `urgent warning success info neutral` |
| Columna numérica desalineada | Falta `font-data` | `className="... font-data text-right"` |
| Skeleton no pulsa | Olvidaste `.skeleton` o pusiste `animate-pulse` manual | `className="skeleton h-4 w-20"` |

---

## Cómo añadir una receta nueva

1. Si te encuentras implementando el mismo patrón por segunda vez, escríbelo aquí.
2. Formato: caso + código copy-paste + link a referencia viva + anti-patterns si aplica.
3. Commit: `docs(ai): cookbook — receta para <X>`.

---

## Referencia

Este cookbook es prompt operativo. Úsalo cuando implementes una pantalla nueva y quieras no reinventar patrones. Leer junto a `specs/design-tokens.md` y `skills/design-system-rollout/SKILL.md`.
