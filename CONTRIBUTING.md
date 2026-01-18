# Contributing

## Reglas rápidas
- Sigue `.cursorrules` y `CONVENTIONS.md`.
- Trabajo por slices (`SLICES.md`).
- No mezclar módulos en una misma entrega.

## Setup local (resumen)
1) Instalar dependencias:
- Node (LTS) + pnpm
- Supabase CLI

2) Levantar Supabase:
- `npx supabase start`
- `npx supabase db reset`

3) Levantar frontend:
- `pnpm install`
- `pnpm dev`

## Antes de abrir PR
- Ejecuta DoD completo (ver `CONVENTIONS.md`).
- Actualiza `SPRINT.md`.
- Añade entrada en `docs/inventory/` con:
  - qué cambió
  - cómo probar
  - decisiones relevantes

## Seguridad
- Nunca subir secrets.
- Nunca hardcodear API keys.
- Nunca usar service_role en cliente.
