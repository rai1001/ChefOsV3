# supabase/rpcs/

RPCs (stored procedures) documentadas como fuente de verdad.

Las RPCs reales viven en las migraciones, pero aquí se mantiene un catálogo por módulo con firma, permisos requeridos y side effects.

**Regla crítica**: toda RPC SECURITY DEFINER empieza con `check_membership()`. Ver `.ai/specs/database-security.md`.
