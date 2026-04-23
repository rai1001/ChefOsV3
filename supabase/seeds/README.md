# supabase/seeds/

Seeds deterministas para entornos local, test y demo.

**Regla crítica**: todo seed respeta `tenant_id` / `hotel_id` y las policies RLS. No hay seeds "cross-tenant".

Seeds esperados en próximos sprints:

- `test-tenant.ts` — tenant de test para E2E (sprint-01).
- `demo-eurostars.ts` — tenant demo con datos reales de Eurostars (sprint-02+).
