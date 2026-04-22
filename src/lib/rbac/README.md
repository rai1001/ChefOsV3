# src/lib/rbac/

Helpers transversales de roles y permisos (cliente).

- `hasRole(user, roles[])` — guard UI.
- Hooks para leer membership actual.

**Regla**: la fuente de verdad de permisos es `.ai/specs/permissions-matrix.md`. Este módulo solo ofrece helpers — la autorización real ocurre en RLS + RPCs (ver `.ai/specs/database-security.md`).
