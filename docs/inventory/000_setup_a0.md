# Setup A0 — Supabase + Usuario seed + Tests

## Objetivo
Que el SaaS sea operable desde minuto 1: login funcional, usuario seed, org seed, dashboard.

## Pasos ejecutados
- [ ] Inicializar Supabase local
- [ ] Aplicar migraciones
- [ ] Añadir seed idempotente (org + datos mínimos)
- [ ] Script para crear usuario inicial (dev/ci)
- [ ] Añadir pgTAP tests para RLS base
- [ ] Añadir smoke e2e (login + dashboard)

## Cómo probar
```bash
npx supabase start
npx supabase db reset
npx supabase test db
pnpm test --coverage
pnpm exec playwright test
```

## Notas
- No ejecutar tests destructivos contra producción.
