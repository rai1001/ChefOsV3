# Inventory (bitácora de construcción)

Este directorio documenta **cada acción relevante** durante la reconstrucción.

## Regla
Cada PR debe añadir o actualizar al menos 1 entrada en esta carpeta.

## Formato recomendado
Nombre de archivo:
- `YYYY-MM-DD_tema.md` (ej. `2026-01-18_setup_supabase_local.md`)

## Plantilla
Copia y pega esta plantilla en un archivo nuevo:

---

## Contexto
- Objetivo:
- Alcance:
- Motivación:

## Cambio realizado
- DB (migraciones, RLS, seeds):
- Backend (RPC/edge/server actions):
- Frontend (rutas, componentes, hooks):

## Cómo probar
Comandos:
- `npx supabase db reset`
- `npx supabase test db`
- `pnpm test --coverage`
- `pnpm exec playwright test`

Pasos manuales (si aplica):
1)
2)

## Evidencias
- Capturas o logs relevantes:

## Notas
- Decisiones tomadas y por qué:
- Deuda técnica generada (si existe) y tarea asociada en `SPRINT.md`:
