# PROMPTS reutilizables (copiar/pegar)

## 1) Crear un slice vertical (DB + RLS + UI + Tests)
"Actúa como Principal Fullstack (Supabase + TS). Crea un slice para <MODULO>/<FEATURE> siguiendo `SLICES.md`. Incluye:
- migración SQL (tablas/índices/tipos)
- RLS (policies + helpers si aplica)
- seed idempotente
- adaptadores data + tipos domain
- UI mínima (list/detail) en español
- tests: pgTAP + vitest + playwright smoke
- actualiza `SPRINT.md` y añade entrada en `docs/inventory/` con pasos de prueba"

## 2) Debug de fallo RLS
"Analiza este error de Supabase/PostgREST y dime:
1) qué policy o helper lo causa
2) cómo reproducir con SQL
3) fix mínimo (policy/with check)
4) test pgTAP que lo cubra"

## 3) Refactor seguro (sin cambiar comportamiento)
"Refactoriza <ARCHIVO/RUTA> manteniendo comportamiento. Reglas:
- no tocar APIs públicas
- añadir tests si falta cobertura
- evitar any
- commits atómicos con Conventional Commits"

## 4) Crear RPC para eliminar N+1
"Propón una RPC `get_<x>_detail` que devuelva un JSON con las dependencias necesarias. Incluye:
- SQL con `security definer` + `set search_path`
- validación de acceso (org/membership)
- test pgTAP
- adapter TS (supabase.rpc) + hook React Query"

## 5) Edge Function segura
"Implementa/ajusta Edge Function <name> con:
- validación de input
- rate limiting por org
- timeout en llamadas externas
- logging estructurado
- errores JSON estándar (ver `ERROR_HANDLING.md`)
- sin keys hardcodeadas (usar secrets)"

## 6) Checklist de PR
"Genera checklist para PR de <FEATURE> alineada con DoD: db reset, pgTAP, vitest, playwright, docs/inventory, sprint update, seguridad RLS."
