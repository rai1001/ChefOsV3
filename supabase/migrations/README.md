# supabase/migrations/

Migraciones SQL del proyecto.

**Naming**: `NNNNN_descripcion_corta.sql` (p. ej. `00001_identity_memberships.sql`).

**Regla crítica** (ADR-0003): Mientras ChefOS v3 comparta proyecto Supabase con v2 (`dbtrgnyfmzqsrcoadcrs`), confirmar que la numeración no colisiona con v2 antes de crear una migración nueva. Fork cuando v3 diverja del schema.
