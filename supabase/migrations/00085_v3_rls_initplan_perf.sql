-- 00085_v3_rls_initplan_perf.sql
-- Sprint hardening-2 — perf trivial en 2 policies RLS v3 con
-- `auth_rls_initplan` (hallazgo D2 auditoría 2026-04-28).
--
-- Problema: `auth.uid() = X` se evalúa por fila. Con 1000+ filas,
-- la diferencia es 100x en latencia de SELECT autenticado.
--
-- Fix: envolver en (select auth.uid()) — Postgres lo cachea como
-- subquery initplan y se ejecuta una sola vez por query.
--
-- Sin cambios funcionales. Mismo predicado lógico.
--
-- Las 5 policies legacy v2 con el mismo problema (profile_own,
-- membership_own, notif_read_own, notif_update_own, prefs_own) NO se
-- tocan desde aquí — viven en el repo ChefOSv2.

begin;

-- =====================================================================
-- v3_profiles_select_self
-- =====================================================================
drop policy if exists v3_profiles_select_self on public.v3_profiles;

create policy v3_profiles_select_self
  on public.v3_profiles
  for select
  using (
    (id = (select auth.uid()))
    or exists (
      select 1
      from public.v3_memberships mine
      join public.v3_memberships other
        on other.hotel_id = mine.hotel_id
      where mine.user_id = (select auth.uid())
        and mine.is_active = true
        and other.user_id = v3_profiles.id
        and other.is_active = true
    )
  );

-- =====================================================================
-- v3_tenants_select_members
-- =====================================================================
drop policy if exists v3_tenants_select_members on public.v3_tenants;

create policy v3_tenants_select_members
  on public.v3_tenants
  for select
  using (
    exists (
      select 1
      from public.v3_memberships m
      where m.tenant_id = v3_tenants.id
        and m.user_id = (select auth.uid())
        and m.is_active = true
    )
  );

commit;
