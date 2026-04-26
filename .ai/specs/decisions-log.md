# ChefOS v3 Decisions Log

## Objetivo

Este documento registra las decisiones técnicas, arquitectónicas y de producto tomadas durante la vida del proyecto ChefOS v3.

Su propósito es evitar:

- decisiones implícitas solo en el código
- re-discusión infinita de temas ya resueltos
- pérdida de contexto sobre por qué algo se hizo así
- divergencia entre lo que se decidió y lo que se implementó

Este documento es normativo en el sentido de que **ninguna decisión estructural relevante puede quedar fuera de este log**.

---

## Principios

1. Las decisiones se escriben aquí, no en conversaciones ni PRs.
2. Cada decisión tiene fecha, contexto, opciones, elección y razón.
3. Las decisiones pueden revisarse, pero requieren una nueva entrada explícita.
4. Las decisiones nunca se borran: si se revierten, se añade entrada nueva con la reversión.
5. Un cambio que contradice una decisión previa sin entrada nueva es un error.

---

## Cuándo registrar una decisión

Debe registrarse cuando el cambio:

- afecta arquitectura oficial
- modifica un contrato público de módulo
- cambia ownership entre módulos
- introduce una librería o dependencia nueva
- cambia reglas de permisos o tenancy
- crea, cambia o elimina un módulo oficial
- cambia convención de naming, estructura o patrón repetido
- introduce una excepción a una regla dura

NO es necesario registrar:

- refactors internos sin cambio de contrato
- fixes de bugs evidentes
- detalles triviales resueltos por código bien estructurado

---

## Formato de entrada

```markdown
### ADR-XXXX — Título corto descriptivo

**Fecha**: YYYY-MM-DD
**Estado**: propuesta | aceptada | rechazada | revertida
**Módulo / área afectada**: [area]

#### Contexto
[qué problema se plantea, qué forzó la decisión]

#### Opciones consideradas
1. [opción 1] — pros / contras
2. [opción 2] — pros / contras
3. [opción 3] — pros / contras

#### Decisión
[opción elegida]

#### Razón
[por qué se eligió esa opción]

#### Consecuencias
- [qué se rompe o cambia]
- [qué tareas derivadas quedan]
- [qué docs actualizar]

#### Revisable
[fecha o condición bajo la que valdría repensarla, si aplica]
```

---

## Reglas de gestión

### Numeración

ADR-0001, ADR-0002, etc. Siempre creciente. Nunca se reutilizan números.

### Estados

- **propuesta**: en discusión, no aplicada aún
- **aceptada**: en vigor, el código la cumple
- **rechazada**: se descartó, no se aplicó
- **revertida**: estuvo en vigor, se revirtió con entrada nueva

### Reversión

Una decisión aceptada que deja de aplicarse NO se borra. Se añade entrada nueva `ADR-XXXX — Reversión de ADR-YYYY` con la razón.

### Linkeo

Una entrada puede referenciar otras (`ver ADR-XXXX`). Mantener el grafo implícito de dependencias.

---

## Entradas iniciales

### ADR-0001 — Stack oficial de ChefOS v3

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: todos

#### Contexto
ChefOS v3 es una reescritura DDD del dominio validado en v2. Necesita stack oficial cerrado para evitar reabrirlo en cada sprint.

#### Decisión
- Next.js 16 (App Router + Turbopack)
- React 19, TypeScript 5 strict
- Supabase (PostgreSQL 17, Auth, RLS, RPCs, Storage, Edge Functions)
- Tailwind CSS 4, Radix UI
- TanStack Query 5, React Hook Form, Zod v4
- Vitest (unit), Playwright (E2E)

#### Razón
Stack validado end-to-end en ChefOS v2 (Eurostars demo, WCAG AA, 52 migraciones en producción). Reusar stack conocido acelera v3 y reduce riesgo.

#### Consecuencias
- No se reabre stack salvo ADR explícita.
- Librerías UI nuevas requieren ADR (ver ADR-0002).

#### Revisable
Cuando Next.js 17 estabilice (si aporta ventaja clara) o si TanStack Query introduce breaking changes.

---

### ADR-0002 — Añadir librería UI requiere ADR

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: componentes/ui

#### Contexto
Tentación recurrente de añadir librerías de componentes "solo para esta pantalla". Riesgo de fragmentación del design system.

#### Decisión
Añadir cualquier librería UI nueva (fuera de Radix UI + Lucide icons) requiere ADR con justificación y plan de consolidación.

#### Razón
El design system de v3 (Industrial Control Surface) está deliberadamente restringido. Libs adicionales erosionan la consistencia.

#### Consecuencias
- Cada PR que añada `@radix-ui/*` extra, shadcn u otra, debe enlazar ADR.
- Excepción automática: utilidades puras sin UI (zod, date-fns, etc.).

---

### ADR-0003 — Supabase compartido con v2 durante migración

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: supabase

#### Contexto
v2 está en producción con 52 migraciones aplicadas. v3 comienza desde cero en código, pero el dominio de datos es el mismo.

#### Decisión
Compartir el proyecto Supabase `dbtrgnyfmzqsrcoadcrs` entre v2 y v3 mientras v3 esté en construcción. Cuando v3 diverja del schema, fork.

#### Razón
- Evita duplicar 52 migraciones.
- Permite migración gradual: v2 sigue vendible mientras v3 se construye.
- El fork se puede hacer vía `pg_dump` cuando toque.

#### Consecuencias
- Antes de añadir migración desde v3, confirmar que no colisiona con numeración de v2.
- Documentar toda nueva migración en ambos proyectos hasta el fork.

#### Revisable
Cuando v3 tenga tablas propias que no existen en v2 (ej. tracking de A/B tests propios).

---

### ADR-0004 — Scaffolding técnico inicial aplicado

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: todos (base del repo)

#### Contexto
`.ai/` cerró sprint-00 documental. Para arrancar sprint-01-identity hace falta base técnica ejecutable: proyecto Next, clientes Supabase, tests corriendo, CI, estructura oficial de carpetas. Sin esto, sprint-01 mezclaría dos trabajos: montar el repo y construir identity.

#### Opciones consideradas
1. **Sprint-00b dedicado** con scaffolding mínimo y sin features — pros: trazabilidad limpia, sprint pequeño, primer merge verificable. Contras: sprint extra antes de features.
2. **Incluir scaffolding en sprint-01** — pros: un sprint menos. Contras: mezcla alcance, sprint grande, revisión difícil.
3. **Copiar `ChefOsv2/` completo y limpiar** — pros: rápido. Contras: arrastra deuda v2 no clasificada, viola `migration-policy.md`.

#### Decisión
Opción 1. Sprint-00b con tareas 00b.01 … 00b.15. Versiones del stack ancladas a v2 (Next 16.2.3, React 19.2.4, Supabase SDK 2.103.0, TanStack 5.99.0, Vitest 4.1.4, Playwright 1.59.1, Tailwind 4). Node 20 LTS vía `.nvmrc`. Prettier y editorconfig añadidos (no normados en specs, se propone como estándar). `supabase/{policies,rpcs}/` creadas vacías con README de ownership.

#### Razón
- Consistencia con ADR-0003 (Supabase compartido → mismo cliente que v2).
- Stack validado en producción Eurostars, demo Iago, 52 migraciones.
- Node 20 matches CI.
- Coverage 90% en `features/*/domain` + `features/*/application` como exige `testing-standards.md`.

#### Consecuencias
- `package.json` anclado a versiones de v2; subir versiones requerirá ADR nueva.
- `tsconfig.json` incluye `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` (más estricto que v2).
- `next.config.ts` con `reactStrictMode: true` (divergencia intencional respecto a v2).
- `playwright.config.ts` añade `webServer` en local (v2 no lo tenía) — Playwright puede arrancar dev server automáticamente.
- `middleware.ts` replica patrón v2 con redirects `/login` y `/signup`. Esas rutas aún no existen → middleware activo solo tras sprint-01-identity.

#### Revisable
Next.js 17 estable, Tailwind 5, o cambios mayores en Supabase SSR.

---

### ADR-0005 — Set base de Radix UI + regla de extensión

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: `src/components/ui/`

#### Contexto
ADR-0001 declara Radix UI oficial. ChefOS v2 no lo usa (primitivos + CVA). Sprint-01-identity necesitará Dialog (login modal), Label (campos form), Toast (errores), Select (rol). Se decide preinstalar set base ahora para evitar una ADR por primitivo en cada sprint.

#### Opciones consideradas
1. **Set base preinstalado** (13 primitivos) — pros: los módulos los consumen sin fricción. Contras: bundle size inicial mayor; riesgo de deps no usadas si algún primitivo nunca se toca.
2. **Diferir cada primitivo al sprint que lo use** — pros: bundle mínimo. Contras: ADR por cada primitivo, fricción en cada sprint.
3. **Preinstalar Radix completo** (40+ primitivos) — pros: zero fricción. Contras: bundle, noise, muchos primitivos nunca usados.

#### Decisión
Opción 1. Set base:
- `@radix-ui/react-slot` (utility CVA)
- `@radix-ui/react-dialog` (modales)
- `@radix-ui/react-dropdown-menu` (menús contextuales)
- `@radix-ui/react-select` (selects accesibles)
- `@radix-ui/react-label` (labels asociados)
- `@radix-ui/react-tooltip` (hints)
- `@radix-ui/react-popover` (popovers)
- `@radix-ui/react-toast` (notificaciones efímeras)
- `@radix-ui/react-checkbox` (checkboxes)
- `@radix-ui/react-switch` (toggles)
- `@radix-ui/react-radio-group` (radios)
- `@radix-ui/react-separator` (separadores accesibles)
- `@radix-ui/react-scroll-area` (scroll custom)

Añadir cualquier Radix fuera de esta lista (Accordion, Collapsible, HoverCard, Menubar, NavigationMenu, Progress, Slider, Tabs, Toggle, Avatar, AlertDialog, ContextMenu, etc.) requiere entrada **ADR-0005-extensión-N** con justificación y uso previsto.

#### Razón
Los 13 primitivos cubren ≥90% del UI de un SaaS B2B sin rodeos. Bundle tree-shaking de Radix es granular — solo pesa lo que se importa.

#### Consecuencias
- `src/components/ui/` construirá wrappers CVA sobre estos primitivos en sprints siguientes.
- Skills/prompts que añadan un primitivo fuera de lista deben linkear ADR-0005-extensión.

#### Revisable
Tras sprint-08 (reporting) revisar si faltan primitivos (ej. Slider para filtros de fechas).

---

### ADR-0006 — `hotel_id` es el identificador de tenant en ChefOS

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: identity, todas las tablas de negocio

#### Contexto
Los specs genéricos de `.ai/` hablan de "tenant" y `tenant_id`. ChefOS v2 (producción) usa `hotel_id` porque el dominio real son cocinas de hoteles. ADR-0003 comparte el Supabase con v2, así que renombrar la columna / las RPCs introduciría deuda innecesaria. Además el dominio narra mejor con `hotel_id` (un hotel puede tener varias unidades operativas = hotels, agrupadas por tenant = empresa).

#### Decisión
Mantener literalmente:
- Columna `hotel_id` en todas las tablas de negocio.
- RPCs `get_active_hotel()`, `get_user_hotels()`, `switch_active_hotel(p_hotel_id)`, `check_membership(p_user_id, p_hotel_id, p_required_roles[])`.
- Tipos TS `Hotel`, `ActiveHotel`, `UserHotel` en `features/identity/domain/types.ts`.

Los specs genéricos de `.ai/` que hablan de "tenant" (p. ej. `core-constraints.md § 1, 4`) se leen como "hotel" en este proyecto. `core-constraints.md` se actualizará en una revisión menor para reflejar esto sin romper la plantilla `_template-app`.

#### Razón
- ADR-0003: Supabase compartido con v2 → renombrar implica migración grande y dual-write.
- Dominio: `hotel` es más preciso que `tenant` para este producto. `tenant` queda como la empresa (`tenants` en DB).
- v2 lleva >52 migraciones con este naming → cero fricción mantener consistencia.

#### Consecuencias
- Cualquier spec o documento de `.ai/` que hable genéricamente de "tenant" aplica a `hotel` en ChefOS. Donde sea ambiguo, preferir `hotel`.
- Tablas nuevas de v3 deben incluir `hotel_id uuid not null`, NO `tenant_id` (salvo cuando el dominio real sea a nivel empresa — entonces `tenant_id` y queda documentado).
- `tenants` sigue existiendo (agrupa varios hoteles de una empresa). El término se reserva para ese nivel.

#### Revisable
Cuando v3 haga fork de Supabase (tras ADR-0003 revisada). En ese momento se puede considerar renombre si aporta claridad, con migración y breaking change controlado.

---

### ADR-0007 — Onboarding fuera de sprint-01

**Fecha**: 2026-04-21
**Estado**: aceptada
**Módulo / área afectada**: identity (scope), commercial (destino futuro)

#### Contexto
Sprint-01 documental dice explícitamente "no incluye: toda la experiencia de login del producto". El onboarding de v2 (`/onboarding/page.tsx` + RPC `create_tenant_with_hotel`) crea tenant + hotel + primer membership admin tras signup. Eso toca lógica de tenant admin — no pertenece a `identity` (cuyo ownership son sesión, usuario actual, hotel actual, permisos base).

#### Opciones consideradas
1. **Fuera de sprint-01** — usuario sin hotel activo va a `/no-access` placeholder. Onboarding se construye en un sprint dedicado (probablemente en o tras sprint-02-commercial).
2. **Incluir onboarding mínimo en sprint-01** — signup + crear tenant/hotel. Rompe ownership: identity absorbe lógica de commercial/tenant-admin.
3. **Crear módulo `tenant-admin` ahora** — separar correctamente pero inflar sprint-01.

#### Decisión
Opción 1. Usuario sin hotel activo → pantalla `/no-access` con CTA "contacta al admin" + botón salir. Onboarding real queda para sprint-02-commercial o un sprint dedicado.

#### Razón
- Mantiene alcance cerrado del sprint (alineado con `sprint-01-identity.md`).
- Respeta ownership: crear tenant/hotel no es responsabilidad de `identity`.
- Los tests y el flow completo de auth están validados en sprint-01; el alta se completa en sprint posterior.

#### Consecuencias
- Durante sprint-01 hasta que se implemente onboarding, los usuarios nuevos que no tengan `memberships` quedan bloqueados en `/no-access`. Para desarrollo local, crear memberships manualmente desde Supabase Dashboard o seed script.
- `sprint-02-commercial.md` (o un sprint-02b dedicado a tenant-admin) debe incluir: onboarding page, RPC `create_tenant_with_hotel` expuesta en UI, invitación de miembros.
- `seeds/demo-eurostars.ts` (planeado en supabase/seeds) creará tenant + hoteles + memberships para entorno demo.

#### Revisable
Cuando se arranque sprint-02 o sprint-02b. Decidir entonces si onboarding va dentro de `commercial` o como módulo separado `tenant-admin`.

---

### ADR-0005-extensión-1 — @react-pdf/renderer para BEO

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `src/features/commercial/components/`

#### Contexto
Sprint-02-commercial requiere generar BEO (Banquet Event Order) como PDF descargable. ADR-0005 prohíbe añadir librerías UI fuera del set base sin extensión explícita.

#### Opciones consideradas
1. **`@react-pdf/renderer` client-side + `dynamic()`** — validado en v2, bundle aislado, sin round-trip server. Patrón probado.
2. **Edge Function server-side con `pdf-lib` o Puppeteer** — bundle client menor pero latencia + complejidad deploy. Permite cache server-side y firmas.
3. **Aplazar BEO a sprint posterior** — cerrar sprint-02 sin PDF.

#### Decisión
Opción 1. `@react-pdf/renderer` añadido como dependencia de producción. Consumido exclusivamente en:
- `src/features/commercial/components/beo-document.tsx` (el Document + Styles)
- `src/features/commercial/components/beo-download-button.tsx` (wrapper con `dynamic(() => import('./beo-document'), { ssr: false })`)

Ningún otro módulo lo importa directamente. Fuera del wrapper, la UI consume solo el botón.

#### Razón
- Patrón v2 en producción (Eurostars demo) sin crash Turbopack cuando se aísla con `dynamic()`.
- Bundle tree-shaking: solo páginas que renderizan el botón cargan el runtime PDF.
- No requiere infraestructura server adicional (Edge Function + deploy + debugging).
- Consistencia con v2 facilita migración del `beo-document.tsx` como referencia.

#### Consecuencias
- `package.json` suma `@react-pdf/renderer` (runtime dep).
- Cualquier otro uso de renderizado PDF fuera de `features/commercial/components/` requiere ADR nueva (reutilizar la lib en otro módulo es OK — añadir OTRA lib de PDF no).
- Si aparece crash Turbopack: primero comprobar que el wrapper `dynamic()` es lo único que importa `beo-document.tsx`. Nunca importar el documento directamente en Server Components.

#### Revisable
Cuando sprint-08-reporting o sprint-05-procurement necesiten PDFs server-side (facturas firmadas, PO con sello), se evaluará si migrar BEO a Edge Function o mantener híbrido.

---

### ADR-0008 — Sprint-02 respeta state machine y schema real de v2

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `commercial`, `supabase`

#### Contexto
`sprint-02-commercial.md` (escrito en sprint-00-foundation) describe un diseño idealizado del dominio comercial con:
- 4 estados: `draft → confirmed → closed + cancelled`.
- Tablas `Room` + `EventRoom` (N:M).
- Enum EventType en español: `Comida, Cena, Pensión completa, Cóctel, Coffee break, Otros`.
- Tabla `EventService` para servicios múltiples por evento.
- Importación Excel con anti-duplicados.

La realidad v2 en el Supabase compartido (`dbtrgnyfmzqsrcoadcrs`, ADR-0003) tiene:
- 8 estados: `draft → pending_confirmation → confirmed → in_preparation → in_operation → completed → archived + cancelled`.
- Tabla `event_spaces` (1:N por evento, sin junction N:M).
- Enum EventType en inglés: `banquet, buffet, coffee_break, cocktail, room_service, catering, restaurant`.
- Sin tabla `event_services`.
- Sin import Excel.

Renombrar o rediseñar en v3 rompería v2 en producción (Eurostars).

#### Opciones consideradas
1. **Aceptar schema real de v2** — sprint-02 usa 8 estados, `event_spaces`, enum inglés. Fuera de alcance: services + Excel.
2. **Mantener diseño idealizado del sprint doc** — requiere migraciones nuevas en v3 (renombrar tablas/estados) + dual-write hacia v2.
3. **Fork Supabase ya** — separar v3 ahora, migrar dominio al schema ideal.

#### Decisión
Opción 1. Mantener el schema y state machine reales de v2. Ajustes concretos:
- Dominio TS usa enum `EventStatus` con 8 valores (match a DB).
- Tipo `EventSpace` (no `Room` ni `EventRoom`) — relación 1:N directa con evento.
- Enum `EventType` en inglés.
- `EventService` queda fuera de alcance sprint-02.
- Import Excel queda fuera de alcance sprint-02 (propuesta sprint-02c o antes de lanzamiento).

`.ai/sprints/sprint-02-commercial.md` recibe nota "AJUSTADO POR ADR-0008" al inicio y en la sección "Detalle específico del dominio".

#### Razón
- ADR-0003 manda: Supabase compartido con v2 en producción. Rediseñar rompe v2.
- v2 lleva >50 migraciones con este naming — cero fricción respetarlo.
- El sprint doc era aspiracional cuando se escribió sin auditar v2; la realidad manda.
- Excel import + EventService son features adicionales, no base del dominio — posponerlas no compromete sprint-02.

#### Consecuencias
- `src/features/commercial/domain/types.ts` usa nombres y enums de v2.
- Nuevas tablas v3 específicas del dominio commercial NO se crean en sprint-02 (solo consumo de v2).
- Sprint-02c o similar queda reservado para Excel import.
- Onboarding va en sprint-02b (módulo `tenant-admin` separado, ADR-0007 ya lo anticipaba).

#### Revisable
Cuando ADR-0003 se revise (fork de Supabase). Entonces se puede renombrar estados/tablas si aporta claridad, con migración controlada.

---

### ADR-0009 — Módulo `tenant-admin` (15º oficial) + arquitectura de invitaciones email+token

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `tenant-admin` (nuevo), `identity` (sin cambios), `supabase/migrations`, core-constraints, module-list

#### Contexto

Sprint-02b implementa el flujo completo de tenant administration: onboarding (crear tenant + primer hotel + primer admin membership), gestión de hoteles adicionales bajo el mismo tenant, team management (listar, rol, desactivar) e invitaciones por email + token. El scope se confirmó completo en AskUserQuestion previo.

Hay cuatro cuestiones que requieren decisión documentada:

1. **Módulo nuevo o absorber en identity.** `module-list.md § 14 módulos oficiales` no incluye `tenant-admin`. `module-list.md § Módulos no oficiales prohibidos salvo ADR` dice que un módulo genérico `admin` está prohibido. ADR-0007 anticipaba `tenant-admin` como módulo separado sin confirmarlo.
2. **Dep `resend` para envío de email** (no UI).
3. **Tabla `invites` nueva + 3 RPCs (`create_invite`, `accept_invite`, `revoke_invite`)** en Supabase compartido con v2.
4. **Excepción a core-constraints § 10 / database-security**: `accept_invite` NO puede empezar por `check_membership()` — el user que acepta aún no tiene membership en el hotel destino.

#### Opciones consideradas

1. **Módulo separado `tenant-admin`** (recomendado). Ownership claro: `tenants`, `hotels` (creación), `memberships` (mutación), `invites`. `identity` sigue siendo owner de sesión, active hotel context, auth flow, profiles, `Role` enum. No contradice `module-list.md § 103` porque esa regla apunta a prohibir un "admin genérico transversal", no a prohibir un módulo de gestión de tenancy con ownership concreto.
2. **Absorber en identity.** Rompe ownership: crear tenants/hoteles/invites no es concern de sesión. Además crecería la superficie pública de identity, complicando su mantenimiento.
3. **Mezclar onboarding en commercial y team management en identity.** Lo peor: disemina el dominio tenant-admin entre dos módulos, rompe DDD.

#### Decisión

**1. Añadir `tenant-admin` como 15º módulo oficial.**
Actualiza `module-list.md`: sección "Módulos oficiales (14)" → "(15)", añade fila `15 | tenant-admin | Tenant, hoteles, memberships, invites | sprint-02b`. Añade a sección "Ownership explícito": `tenant-admin` es owner de crear/listar `tenants`, crear/listar `hotels`, mutar `memberships` (rol, activo), crear/aceptar/revocar `invites`. Identity sigue dueño de consultar active hotel context, roles enum, profiles.

**2. Dep `resend` añadida como utility de integración (no UI).** Excepción ADR-0002 ya lo permite (no-UI). La registramos aquí por trazabilidad. Alternativa descartada: Supabase Auth invite flow (fuerza confirm_email global, rompería signup comercial).

**3. Tabla `invites` creada en migración `00053_sprint02b_invites.sql`** (v2 va hasta 00052, cero colisión con ADR-0003). Campos: `id, hotel_id, tenant_id, email (lowercased), role, token_hash (sha256 del token plano), expires_at (default now()+7d), created_by, created_at, accepted_at, accepted_by, revoked_at`. UNIQUE parcial `(hotel_id, lower(email)) WHERE accepted_at IS NULL AND revoked_at IS NULL`. RLS: admin/direction/superadmin del hotel pueden leer/escribir. El token plano solo existe en (a) respuesta de `create_invite`, (b) URL del email. Nunca persiste.

**4. Excepción documentada a la regla "RPC SECURITY DEFINER sin check_membership en primera línea"**: `accept_invite(p_token text)` no puede invocar `check_membership` porque el caller todavía no es miembro del hotel destino. Validación equivalente del token:
   - `auth.uid() IS NOT NULL` (requiere sesión).
   - `token_hash` match contra `invites.token_hash`.
   - `accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()`.
   - `lower(invites.email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))`.
   
   Las otras dos RPCs (`create_invite`, `revoke_invite`) SÍ llevan `check_membership` en primera línea (rol admin/direction/superadmin requerido). `core-constraints.md` recibe una nota añadida a la regla 3.c apuntando a esta ADR.

#### Razón

- Ownership limpio: tenant lifecycle ≠ session lifecycle. Separar acelera mantenimiento.
- Migración numerada >= v2 respeta ADR-0003. Tabla nueva, no modifica schema existente → sin impacto en v2 producción.
- Resend aislado a `src/lib/email/` con skip automático si `RESEND_API_KEY` vacío (dev friendly).
- Excepción de `accept_invite` es narrow, documentada, y la validación alternativa es equivalente en fuerza (token criptográfico + email match).

#### Consecuencias

- `module-list.md` pasa a 15 módulos.
- `core-constraints.md § 3.c` recibe nota sobre excepción `accept_invite`.
- `permissions-matrix.md` añade `tenant.create`, `hotel.create`, `team.manage` (si no estaba), `invite.create`, `invite.accept`, `invite.revoke`.
- `domain-events.md` añade `tenant.created`, `hotel.created`, `member.invited`, `member.accepted`, `member.revoked`.
- `.env.example` añade `RESEND_API_KEY` (opcional dev, requerida prod).
- `src/app/(app)/layout.tsx` cambia `redirect('/no-access')` → `redirect('/onboarding')` cuando `getActiveHotelOrNull()` retorna null.
- `/no-access` queda reservado para edge cases (tenant desactivado, membership bloqueada).

#### Revisable

Cuando v3 haga fork de Supabase (ADR-0003 revisada). Entonces podemos reconsiderar si `tenant-admin` sigue siendo un módulo separado o si invites migran a `notifications` con un patrón genérico.

---

### ADR-0005-extensión-2 — Añadir `@radix-ui/react-tabs` al set base

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `src/components/ui/`

#### Contexto

Sprint-03-recipes necesita detalle de receta con 5 tabs (info, ingredientes, pasos, sub-recetas, alérgenos). Implementar tabs sin Radix implica reinventar:
- focus management
- keyboard navigation (flechas)
- ARIA (tablist/tab/tabpanel)
- active state sync con URL opcional

El coste de reinventar > bundle cost de Radix Tabs (granular, tree-shakeable).

#### Decisión

Añadir `@radix-ui/react-tabs` como extensión al set base ADR-0005. Wrapped en `src/components/ui/tabs.tsx` con estilos Industrial Control Surface.

#### Razón

- Accesibilidad gratuita (WCAG AA).
- Bundle mínimo (~3KB minificado por primitivo, tree-shaking automático).
- Coherencia con otros primitivos Radix ya en el set (Dialog, Select, DropdownMenu, etc.).

#### Consecuencias

- `package.json` suma `@radix-ui/react-tabs`.
- Ningún otro módulo fuera de `recipes` lo usa todavía; disponible para futuros sprints sin nueva ADR.

---

### ADR-0010 — Módulo `menus` como 16º oficial

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `menus` (nuevo), `recipes`, module-list

#### Contexto

Sprint doc `sprint-03-recipes.md` anticipa `Menu` + `MenuSection` como parte de `recipes` (fiel a v2 donde ambos viven en el mismo módulo). Al implementar se evidencia que fusionar rompe ownership:

- **Recipes** es owner de fichas técnicas, escandallo, producción, costeo recursivo.
- **Menus** es owner de composición comercial (qué recetas van en cada sección, precio al cliente, alérgenos agregados, tipos buffet/seated/cocktail).
- **Consumidores de menus**: `commercial` (BEO), `reporting` (margen por menú).
- **Consumidores de recipes**: `menus`, `production`, `procurement`.

Fusionar contamina el contrato público (expone types `Menu*` junto a `Recipe*` sin relación natural) y fuerza a `commercial` a importar `@/features/recipes` solo para tocar menús.

#### Opciones consideradas

1. **Módulo separado `menus` (recomendado)** — ownership claro, contratos aislados. Requiere esta ADR + update module-list.
2. **Dentro de recipes** (como v2) — ahorra una ADR pero rompe DDD.
3. **Dentro de commercial** — menús se componen ahí. Contamina commercial con gestión de recetas.

#### Decisión

Añadir `menus` como 16º módulo oficial.

- Ownership: tablas `menus`, `menu_sections`, `menu_section_recipes`.
- Consume `@/features/recipes` por contrato público (para listar recetas aprobadas al componer sections).
- NO toca internals de recipes.

`module-list.md` → 16 módulos. `sprint-03-recipes.md` recibe nota "AJUSTADO POR ADR-0010". Se crea `sprint-03b-menus.md` con el sprint específico.

#### Razón

- Ownership limpio: composición comercial ≠ ficha técnica culinaria.
- Consumers distintos: BEO usa menus, no recipes directamente.
- Facilita mantenimiento: cambios en menus no tocan recipes y viceversa.

#### Consecuencias

- 16 módulos oficiales (antes 15 por ADR-0009).
- Sprint-03 se divide en 2 módulos paralelos (recipes + menus) en la misma sesión.
- Sin migración nueva: tablas v2 existentes se consumen directamente.
- `commercial` en sprint futuro podrá importar `@/features/menus` para BEO sin violar ownership.

#### Revisable

Cuando aparezca una relación operativa entre ambos (ej. menus necesitando mutar recipe_ingredients). Entonces reconsiderar fusión.

---

### ADR-0011 — Hardening de superficie pública: rate-limit + headers HTTP + origin allowlist

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `proxy`/middleware, `next.config.ts`, `tenant-admin/application`, `identity/application`

#### Contexto

Auditorías externas (Codex y Antigravity, sprint-hardening) identifican tres huecos en la superficie pública del SaaS antes de pasar a venta:

1. **SEC-001 / SEC-002**: login y forgot-password sin rate limit + errores Supabase crudos expuestos al cliente. Combinado permite enumeración de cuentas y brute force.
2. **SEC-003**: `createInviteAction` construye la URL de invitación a partir de headers `host`/`x-forwarded-proto` sin allowlist. Spoofing del header `Host` en proxies mal configurados → links de invitación apuntando a dominios de atacante.
3. **SEC-004**: `next.config.ts` solo declara `reactStrictMode: true`. Sin CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. La defensa frente a XSS/clickjacking depende del default del proveedor de hosting.

#### Opciones consideradas

1. **Hardening inline en cada acción/ruta** — pros: granularidad. Contras: fácil olvidar uno, fácil divergir entre rutas.
2. **Capa transversal `src/lib/{rate-limit,errors}` + edge middleware + headers en `next.config.ts`** — pros: punto único, auditable, fácil de testear. Contras: requiere infra (Upstash) y reescritura del middleware existente.
3. **Aplazar a producción** — pros: cero esfuerzo ahora. Contras: hueco real explotable hoy si alguien encuentra la URL del entorno demo. Bloquea salida comercial.

#### Decisión

Opción 2. Hardening centralizado:

- **Rate limit**: `@upstash/ratelimit` + `@upstash/redis` REST. Backend Edge-compatible (Vercel Edge Functions y Workers). Persistencia entre instancias serverless. Free tier 10k cmds/día → suficiente para dev + early users.
  - Límites por defecto:
    - `login`: 5 intentos / minuto / IP.
    - `forgot-password`: 3 intentos / 15 minutos / IP.
    - `invite-accept`: 10 intentos / minuto / IP.
  - Variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en `.env.example`. Si vacías en dev → modo "skip" (logging warning, no bloquea).
  - Implementación en `src/lib/rate-limit/index.ts`. Aplicado vía middleware en `src/proxy.ts` y/o invocado desde server actions sensibles.

- **Errores auth normalizados**: catálogo en `src/features/identity/domain/auth-errors.ts` con códigos `invalid_credentials`, `email_not_confirmed`, `rate_limited`, `network_error`, `generic`. Mensajes neutros al usuario, log interno con correlation id (UUID v4).

- **Origin allowlist**: `createInviteAction` deja de leer `host` y `x-forwarded-proto`. Usa `process.env.NEXT_PUBLIC_APP_URL` validado contra allowlist por entorno (`localhost:3000` en dev, dominios canónicos en prod). Nueva env `APP_URL_ALLOWLIST` (CSV) opcional.

- **Headers HTTP**: `next.config.ts` exporta `headers()` con:
  - `Content-Security-Policy`: nonce + `strict-dynamic` para scripts. `default-src 'self'`. `connect-src` permite Supabase y Upstash.
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
  - `X-Frame-Options: DENY`.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

#### Razón

- Upstash es el backend Edge-compatible más usado del ecosistema Vercel/Next.js. SDK pequeño, sin servidor que gestionar.
- Allowlist evita la clase de ataque "attacker controla `Host` → recibe URLs con su dominio". Trivial de explotar si hay reverse proxy mal configurado.
- Headers explícitos en `next.config.ts` los hace auditables en repo (no dependen del hosting). CSP con nonce es la única defensa real contra XSS reflejado en una SPA.
- Errores normalizados elimina la enumeración de cuentas (mensaje siempre genérico) y deja log interno para debug.

#### Consecuencias

- `package.json` suma `@upstash/ratelimit` y `@upstash/redis` (runtime).
- `.env.example` añade `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Producción debe definirlas o el rate limit no aplica (degradación segura: skip + warning, no bloqueo).
- `src/proxy.ts` se amplía para invocar rate-limit en rutas auth (login, signup, forgot-password) y para invitaciones.
- `src/features/tenant-admin/application/create-invite-action.ts` queda sin `headers()` calls — usa `getCanonicalAppUrl()` del nuevo `src/lib/app-url/`.
- `next.config.ts` deja de ser un one-liner — pasa a usar `async headers()`.
- Cualquier nueva server action sensible debe envolverse con `withRateLimit(...)` o equivalente, o documentar exención.

#### Revisable

Cuando alcancemos >100 hoteles activos (Upstash free tier puede quedarse corto), o si Vercel introduce rate-limit nativo equivalente.

---

### ADR-0012 — Tipos Supabase autogenerados como fuente única de verdad de DB

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `src/types/database.ts`, `src/features/*/infrastructure/`

#### Contexto

Auditoría Antigravity (quick win) señala que los tipos TS de las tablas se mantienen a mano en `domain/types.ts`. Riesgo de drift contra el schema real cuando se añade columna o cambia tipo. v2 vivió este problema dos veces (campos null vs not null divergentes).

`supabase gen types typescript` produce tipos desde el schema en vivo del proyecto (`dbtrgnyfmzqsrcoadcrs`, ADR-0003), incluyendo nullability, FKs, enums, RPCs.

#### Opciones consideradas

1. **Tipos a mano en `domain/types.ts` (status quo)** — pros: control total, expresivo. Contras: drift inevitable, doble fuente de verdad.
2. **Tipos autogenerados como fuente única** — pros: nunca diverge del schema, refleja constraints reales. Contras: tipos verbosos, requieren wrapping en `domain/` para narrativa de negocio.
3. **Híbrido: autogenerados como base + tipos de dominio que mapean** — pros: lo mejor de los dos mundos. Contras: dos capas de tipos.

#### Decisión

Opción 3 (híbrido). 

- Script `npm run db:types` ejecuta `supabase gen types typescript --project-id dbtrgnyfmzqsrcoadcrs > src/types/database.ts`. CI valida que el archivo no diverge del schema (futuro check opcional).
- `src/types/database.ts` contiene tipos `Database`, `Tables<'X'>`, `Enums<'Y'>` autogenerados. NO se edita a mano.
- `infrastructure/*-queries.ts` consume tipos generados directamente (`Tables<'events'>`).
- `domain/types.ts` mantiene tipos de negocio narrativos (`Event`, `EventDraft`, `EventStatus`) que pueden:
  - extender el row tipo con cálculos derivados (`Event = Tables<'events'> & { computedField: ... }`),
  - restringir nullability cuando el dominio garantiza más que la DB,
  - exponer enums propios cuando el dominio difiere del PostgreSQL enum.

#### Razón

- v2 sufrió bugs por divergencia (`null` vs `undefined`, columna añadida sin reflejar en TS).
- Migrar a 100% autogenerado obliga a usar nombres y nullability del schema, perdiendo narrativa de dominio. El híbrido respeta ownership: DB define forma física, dominio define semántica.
- `gen types` es idempotente y trivialmente versionable en git → diff entre runs detecta cambios de schema sin sorpresas.

#### Consecuencias

- `package.json` añade script `db:types` y opcionalmente `db:types:check`.
- `src/types/database.ts` aparece como archivo trackeado (NO ignorar en `.gitignore`).
- Refactor progresivo: cada `infrastructure/*-queries.ts` migra cuando se toque (no big-bang). El mapping a tipos de dominio se centraliza en helpers `mapRowToEvent(row)`, etc., en `infrastructure/`.
- `domain/types.ts` evoluciona para extender, no duplicar.
- Cualquier cambio de schema (nueva migración) debe ir acompañado de `npm run db:types` y commit del diff.

#### Revisable

Si Supabase lanza CLI con generación de tipos a `domain/` directamente (improbable). O si v3 hace fork de Supabase y los tipos se generan desde el nuevo schema.

---

### ADR-0013 — Módulo `import` (17º oficial) + arquitectura híbrida client+server para Excel bulk

**Fecha**: 2026-04-22
**Estado**: aceptada
**Módulo / área afectada**: `import` (nuevo), `recipes` (consumidor de RPC bulk), `supabase/migrations`, module-list

#### Contexto

Israel: "tiene todo el mundo las recetas y escandallos en Excel lo necesitamos para eliminar friccion". Sprint-03c-import-excel ataca el pain de migración: 200 recetas en <10 min.

Cuatro decisiones a documentar:

1. **Nuevo módulo o ampliación de recipes.** El placeholder original (`sprint-03c-import-excel.md`) sugería ampliar recipes. Pero el dominio "import bulk desde Excel/CSV" trasciende recetas: futuros sprints querrán importar productos (sprint-04), inventario inicial (sprint-06), histórico de eventos (sprint-02 follow-up). Si vive en recipes, contamina el contrato público y obliga a moverlo cuando se reuse.
2. **Librería Excel.** `xlsx` (SheetJS) vs `exceljs`. SheetJS community es Apache 2.0 (no AGPL como leyenda urbana sugería), más ligera. ExcelJS es MIT, más pesada (~870KB) pero soporta escritura con estilos (necesario para template descargable).
3. **Parse client vs server vs híbrido.** Parse client da feedback inmediato. Server da consistencia. Híbrido: parse + preview en cliente, server valida con Zod y commit RPC.
4. **Atomicidad y mapeo de productos.** Todo-o-nada vs parcial. Auto-create productos vs NULL+mapping posterior.

#### Opciones consideradas

1. **Módulo separado `import` (recomendado)** — owner único de import bulk. RPCs `import_X_bulk(p_hotel_id, p_payload jsonb) → jsonb`. Tabla `import_runs` (audit log). Consume contratos públicos de los módulos destino sin tocar internals.
2. **Ampliar recipes** — más rápido pero contamina recipes y debe extraerse cuando aparezca import productos.
3. **Sin módulo, lógica inline en página** — viola DDD, no testeable, no reutilizable.

#### Decisión

**1. Módulo separado `import`.** Añadido como 17º oficial. Owner de:
- Tabla `import_runs` (id, hotel_id, kind, status enum, total_rows, ok_rows, failed_rows, errors jsonb, created_by, started_at, finished_at).
- RPCs bulk: `import_recipes_bulk` en sprint-03c. Futuras: `import_products_bulk`, `import_inventory_bulk`, etc.
- Parser Excel + Zod schemas + UI form/preview/result.
- Endpoint `/api/import/template/<kind>` para descargar plantillas xlsx pregeneradas runtime.

NO es owner de:
- Las tablas destino (recipes/products) — se llaman vía RPC SECURITY DEFINER que valida `check_membership` y hace los inserts.

**2. ExcelJS** (MIT). Más pesada pero permite escribir templates con header marcado (bold + color) y validación de celdas. Compensa en UX. Bundle aceptable porque solo se carga en `/recipes/import` (dynamic import).

**3. Híbrido**: parse client (feedback inmediato + preview interactivo), server action recibe el payload JSON y aplica Zod + invariantes cruzadas (FK por nombre de receta), RPC commit por fila con array de errores devuelto.

**4. Atomicidad parcial**: RPC commitea las recetas válidas + devuelve `{ ok_count, failed: [{ row_index, name, errors[] }] }`. El frontend muestra resumen y permite descargar CSV con las filas fallidas para corregir y reimportar. **Mapeo productos**: en sprint-03c los ingredientes se importan con `product_id: null` y `unit_id: null` — quedan en estado "mapping pendiente" (UI ya lo soporta vía `unmappedIngredients()`). Sprint-04-catalog añadirá UI de mapping bulk post-import.

#### Razón

- Ownership separado escala: el import será reutilizado por catalog/inventory/etc.
- ExcelJS justificado por capability template generation (DX importa para adopción comercial).
- Parse híbrido evita la trampa de "subir 5MB de XLSX al server sin saber si es válido".
- Atomicidad parcial es la única que escala a 200+ filas (todo-o-nada frustra; mapping previo es fricción inaceptable).
- Diferir mapping evita scope creep hacia sprint-04-catalog.

#### Consecuencias

- `module-list.md` pasa a 17 módulos.
- Migración `00054_sprint03c_import.sql`: tabla `import_runs` + enum `import_kind` + enum `import_status` + RPC `import_recipes_bulk`.
- `package.json` suma `exceljs` (runtime dep).
- Bundle `/recipes/import` ~+870KB de exceljs (acceptable, dynamic import).
- Cualquier RPC bulk futura debe seguir el contrato `(p_hotel_id, p_payload jsonb) → jsonb { ok_count, failed[] }` y registrar en `import_runs`.
- `permissions-matrix.md` añade `import.recipes`, `import.products` (futuro).
- UI de "mapping pendiente" en recipes ya existe — aprovechar para el flujo post-import.

#### Revisable

Cuando se construyan ≥3 RPCs bulk (recipes + products + inventory), reevaluar si el módulo necesita refactor (extraer parser y validators a `lib/excel/`).

---

### ADR-0014 — Módulo `catalog` partido en 3 sub-sprints

**Fecha**: 2026-04-23
**Estado**: aceptada
**Módulo / área afectada**: `catalog` (nuevo), `recipes` (consumidor mapping), `supabase/migrations`, module-list, sprint docs

#### Contexto

`sprint-04-catalog.md` absorbe el dominio completo de v2 (Product + ProductCategory + ProductAlias + PriceHistory + Supplier + SupplierConfig + SupplierOffer + SupplierIncident + ProductSupplierRef + métricas + bus de eventos + precedencia GR>offer>manual). El alcance es ~20h de trabajo y mezcla concerns de niveles muy distintos:

1. Maestro básico de productos/unidades/alias — **desbloqueo crítico** para mapear ingredientes NULL que dejó sprint-03c.
2. Proveedores + ofertas con SKU/conversión — **habilitador** para escandallo con precios reales y sprint-05-procurement.
3. Incidencias + métricas + eventos + precedencia GR — **observabilidad y calidad** que requiere datos reales de sprint-05-procurement (GRs) para tener sentido.

Ejecutarlo como un único sprint produce un PR gigante, riesgo alto de regresión, y acopla entregables con dependencias temporales distintas (04c sin GRs no tiene datos que alimentarlo).

#### Opciones consideradas

1. **Sprint único (doc tal cual)** — fiel al doc, pero ~20h, PR inmanejable, bloquea recipes más tiempo del necesario.
2. **Partir en 3 sub-sprints** — 04a (core + mapping import), 04b (suppliers + offers), 04c (incidencias + métricas + eventos, post sprint-05).
3. **Recortar scope permanente** — borrar del doc incidencias/métricas/eventos. Rechazado: v2 lleva esto en producción y Eurostars lo usa; no es scope fantasma.

#### Decisión

**Partir `sprint-04-catalog` en 3 sub-sprints** mantenidos como documentos independientes bajo `.ai/sprints/`:

- **`sprint-04a-catalog-core.md`** — units + products + product_categories (por hotel) + product_aliases + price_history (tabla solo, sin triggers) + RPC `resolve_ingredient_mapping_bulk` + RPC `match_product_by_alias`. UI: `/catalog/products`, `/catalog/units`, `/recipes/mapping`. Estimado 4-5h. Cierra el NULL de sprint-03c.
- **`sprint-04b-catalog-suppliers.md`** — suppliers + supplier_config + supplier_offers + product_supplier_refs + RPC `get_catalog_prices` (precedencia offer > manual; GR en 04c) + RPC `mark_offer_preferred`. UI: `/catalog/suppliers`. Estimado 5-6h. Habilita escandallo con precios reales.
- **`sprint-04c-catalog-observability.md`** — supplier_incidents + triggers desde `goods_receipts` + RPC `record_supplier_incident` + RPC `get_supplier_metrics` + bus de eventos dominio + extender `get_catalog_prices` con precedencia GR. Estimado 3-4h. **Se ejecuta DESPUÉS de sprint-05-procurement** (dependencia de datos).

El `sprint-04-catalog.md` original se conserva como **doc paraguas** (apunta a los 3 sub-docs y no se implementa directamente).

#### Razón

- 04a desbloquea mapping NULL de sprint-03c (alto valor, bajo riesgo, independiente).
- 04b entrega proveedores sin depender de incidencias (independiente de 05).
- 04c sin 05 es código muerto (incidencias y métricas necesitan GRs reales).
- PRs de tamaño revisable (<1000 LOC cada uno).
- Permite pausar entre bloques para probar en producción.
- Preserva el doc paraguas: el dominio completo sigue reflejado, no se pierde contexto v2.

#### Consecuencias

- `module-list.md` mantiene 17 módulos. `catalog` (módulo 7) sigue siendo el mismo, pero el sprint de entrega se parte en 04a/04b/04c.
- Numeración migraciones: 00055-00058 en 04a, 00059-00062 en 04b, 00073-00075 en 04c (tras sprint-05).
- ADR-0014 puede revisarse si 04a descubre que productos dependen más de lo esperado de units/categories y fuerza merge de 04a+04b.
- Eventos de dominio consolidados en 04c + sprint-14-agents (infrastructure de bus). Hasta entonces, emisiones stubbed.

#### Revisable

Si al cerrar 04a se descubre que separar suppliers+offers es artificial (el UI necesita crear supplier inline al crear oferta), fusionar 04b en 04a y renombrar. Revisar tras 04a.

---

### ADR-0015 — Namespace `v3_` total (tablas + RPCs + enums + triggers + índices)

**Fecha**: 2026-04-24
**Estado**: aceptada
**Módulo / área afectada**: TODO v3 (todos los módulos) + supabase/migrations + capa infrastructure

#### Contexto

Desde el arranque de v3 se aplicó ADR-0003 (Supabase compartido con v2). Consecuencia práctica: v3 reutiliza tablas v2 directamente (`products`, `suppliers`, `recipes`, etc.) y crea tablas propias sin prefijo (`invites`, `import_runs`). Durante sprint-04 esto generó tres clases de fricción repetidas:

1. **Colisiones de schema**: el plan inicial de sprint-04a intentó crear `products`/`units` como tablas paralelas; la DB ya las tenía de v2 con schema diferente. Rollback + rediseño sobre schema v2.
2. **Bugs por asumir schema v3 cuando era v2**: constraint unique compuesto distinto al esperado (`supplier_configs` `onConflict`), enums con valores no documentados (`storage_type` = ambient/refrigerated/frozen, no los que v3 supuso), RLS con policy solo SELECT donde v3 necesita INSERT (`price_history`).
3. **Imposibilidad de refactor atómico**: cambiar la forma de una tabla sin romper Eurostars producción v2.

La productividad esperada se ve erosionada porque **cada sprint nuevo repite el mismo patrón**: descubrir schema v2 → adaptar v3 → topar con diferencia → fix. Sprint-05-procurement iba a ser el siguiente caso (PO/PR/GR son tablas que también existen en v2 con nombres distintos).

Alternativa considerada en sprint-04: prefijo `v3_` solo en tablas nuevas (las que v2 no tiene). Aceptada en una revisión previa pero descartada porque no resuelve el problema real — v3 sigue mutando tablas compartidas con v2.

El patrón RestoOS v2 (documentado en memoria usuario) prefija con `v2_` todas las tablas nuevas y migraciones. Al sunset de v1 → migración final renombra `v2_*` → nombres limpios y dropea v1.

#### Opciones consideradas

1. **Rewrite total con prefijo `v3_`** (esta ADR). Costoso ahora, liberador después.
2. **Status quo con ADR-0014 revisado** (solo prefijo en tablas nuevas que v2 no tiene). Rechazada porque no elimina la fricción en módulos que mutan tablas v2.
3. **Fork Supabase project separado para v3**. Clean slate pero duplica ops (auth, buckets, edge functions, URL producción, dominios) y rompe ADR-0003. Rechazada por coste operacional alto y porque retrasa entrega.

#### Decisión

**Rewrite total con prefijo `v3_`.** Aplica a:

- **Tablas**: `v3_tenants`, `v3_hotels`, `v3_memberships`, `v3_profiles`, `v3_events`, `v3_invites`, `v3_recipes`, `v3_recipe_ingredients`, `v3_recipe_steps`, `v3_menus`, `v3_menu_sections`, `v3_products`, `v3_product_aliases`, `v3_units_of_measure`, `v3_suppliers`, `v3_supplier_configs`, `v3_supplier_offers`, `v3_product_supplier_refs`, `v3_price_history`, `v3_import_runs`, + cualquier tabla nueva en sprints 05+.
- **Enums**: `v3_app_role`, `v3_recipe_status`, `v3_recipe_category`, `v3_recipe_difficulty`, `v3_product_storage_type`, `v3_unit_type`, `v3_alias_source_type`, `v3_import_kind`, `v3_import_status`, `v3_price_source`, + cualquier enum nuevo.
- **Funciones/RPCs**: `v3_check_membership`, `v3_is_member_of`, `v3_get_member_role`, `v3_get_active_hotel`, `v3_create_invite`, `v3_accept_invite`, `v3_revoke_invite`, `v3_preview_invite`, `v3_import_recipes_bulk`, `v3_match_product_by_alias`, `v3_resolve_ingredient_mapping_bulk`, `v3_mark_offer_preferred`, `v3_get_catalog_prices`, + RPCs nuevos.
- **Triggers**: `v3_tg_price_history_from_offer`, + triggers nuevos.
- **Índices**: `v3_products_name_trgm`, `v3_product_aliases_alias_name_trgm`, etc. (incluso si el índice es autogenerado por PK / FK, debe cumplir la convención cuando sea posible).
- **Migraciones**: `NNNNN_v3_<descripcion>.sql`.

**Data v2 se migra con seed** (copia `products → v3_products`, `recipes → v3_recipes`, etc.) una sola vez al crear el schema v3_. A partir de ese punto v2 y v3 **divergen**. Cambios en v3 NO se propagan a v2 y viceversa. Eurostars Iago (cliente v1/v2) sigue con v2 hasta que se migre a v3 explícitamente.

**Types TS internos mantienen nombre corto** (`Product`, `Supplier`, `RecipeIngredient`). El prefijo `v3_` vive solo en DB y en infra (`supabase.from('v3_products')`, `supabase.rpc('v3_get_catalog_prices')`). Eso preserva la DX para features TS y queda como detalle de infraestructura.

**Migración futura al sunset v2**: una migración única renombra `v3_*` → nombre limpio y dropea tablas v2 equivalentes. Generable automáticamente con script que lee este ADR.

#### Razón

- **Coste una vez vs. coste repetido**: el refactor es 20-30h. Sin él, cada sprint futuro pierde 3-5h en descubrimientos v2.
- **Aislamiento total de v2**: Eurostars producción blindada. v3 puede mutar schema libremente.
- **Testing limpio**: los smokes y E2E trabajan sobre data v3 que podemos resetear sin miedo.
- **DX mejor**: `v3_` deja claro en la query qué es v3. Al leer código, `supabase.from('v3_products')` vs `supabase.from('products')` da contexto.
- **ADR-0003 sigue válido**: Supabase se comparte a nivel proyecto, solo cambia la convención dentro del schema `public`.
- **Replica patrón RestoOS v2 probado**: mismo patrón ya aplicado en otro proyecto de Israel.

#### Consecuencias

- ADR-0003 pasa a estado "vigente pero aumentado por 0015": mismo proyecto, schema namespaced.
- PR #46 (sprint-04b) **cerrado sin merge** 2026-04-24. Código rescatado a branch `feature/v3-namespace-rewrite` para rewrite.
- ADR-0014 (catalog partido en 04a/04b/04c) vigente pero migraciones 00055-00057 pierden su valor incremental — pasan a ser baseline del rewrite que se ejecutará entero en la rama nueva.
- Numeración migraciones rewrite: 00058+ con patrón `NNNNN_v3_<nombre>.sql`.
- Seed script debe copiar data de Eurostars demo hotel (`22222222-2222-2222-2222-222222222222`) como mínimo. Otros hoteles según política que se decida al aplicar.
- Refactor TS en cada feature folder (identity, commercial, tenant-admin, recipes, menus, import, catalog): buscar/reemplazar `.from('X')` → `.from('v3_X')` y `.rpc('Y')` → `.rpc('v3_Y')`.
- `src/types/database.ts` se regenera una vez completas las migraciones. Mientras ADR-0003 siga vigente, conviven types v2 y v3_; la capa v3 consume solo `v3_*`.
- Tests: los mocks cambian nombre de tabla/RPC. Los tests de dominio (invariants, schemas) no cambian.

#### Estado de implementación

- **Fase 1 DB cerrada**: 2026-04-24, commit `cd192f0`. Migraciones `00058`–`00062` aplicadas: 32 tablas `v3_*`, 18 enums, 40 funciones/RPCs `v3_*`, 1 trigger, 33 policies y seed Eurostars demo.
- **Fase 2 TS cerrada**: 2026-04-25, commits `ee9ea48..a79ce79` más commit de cierre docs/smoke. `src/` y `e2e/` ya no tienen callsites `.from()` / `.rpc()` a tablas/RPCs v2, salvo comentario documental en `src/lib/errors/map-supabase-error.ts`.
- **Smoke end-to-end**: 2026-04-25, cuenta `demo-admin@eurostars-demo.es`, hotel `22222222-2222-2222-2222-222222222222`. Verificado login, dashboard, productos (32), proveedores (4), ofertas (30 vía detalle proveedor), recetas (6), escandallo live, creación de evento con limpieza posterior, menús (2), mapping y equipo (3 memberships).
- **Limpieza heredada smoke 04b**: eliminados fixtures exactos documentados (2 `recipe_ingredients`, 3 `product_aliases`, 1 `product`, 1 `supplier_config`, 1 `supplier`). No existían ofertas ni price_history asociadas al fixture al ejecutar la limpieza.
- **Deuda heredada a sprint-05**: `v3_get_escandallo_live` y `v3_sync_escandallo_prices` siguen leyendo `public.goods_receipts` / `public.purchase_orders` v2 hasta que sprint-05 cree `v3_goods_receipts` / `v3_purchase_orders`. `v3_supplier_incidents.purchase_order_id` mantiene FK omitida hasta existir target v3.

#### Revisable

Si durante el rewrite se descubre que:

- Un hotel nuevo (que no sea el Eurostars demo) vive en v2 y debe migrarse también → ampliar seed.
- Dos módulos chocan en el mismo nombre de tabla (improbable, pero posible si el prefijo se aplicó de forma inconsistente) → revisión de naming.
- Edge functions v2 siguen tocando tablas v2 → decidir si reapuntarlas a v3 o dejarlas legacy (probable: dejar legacy, planificar migración).

Si dentro de 30 días tras aplicar ADR-0015 el rewrite no se cerró y está generando más fricción que beneficio → re-evaluar o revertir a Fork Supabase project.

---

### ADR-0016 — Sprint 05 procurement partido en 05a/05b/05c

**Fecha**: 2026-04-26
**Estado**: aceptada
**Módulo / área afectada**: `procurement`, `catalog`, `inventory`, `supabase/migrations`, domain events

#### Contexto

El documento paraguas `sprint-05-procurement.md` recoge el flujo completo `necesidad → pedido → recepción → conciliación`, incluyendo Goods Receipts, inventario y OCR de albaranes. Implementarlo en un único PR mezcla DB, UI, inventario, OCR, rate limits, edge functions y cascada de precios.

Además, tras ADR-0015 todo el módulo debe nacer sobre objetos `v3_*`, sin mutar tablas v2 compartidas.

#### Decisión

Partir `sprint-05-procurement` en tres entregas:

- **05a - PR/PO base**: `v3_purchase_requests`, `v3_purchase_request_lines`, `v3_purchase_orders`, `v3_purchase_order_lines`, `v3_price_change_log`, state machines PR/PO, RLS, RPCs v3, consolidación por proveedor y UI mínima.
- **05b - Goods Receipts + inventario**: recepción completa/parcial, actualización de lotes, enlace real con `inventory`, cierre de deuda de queries que aún apuntan a tablas v2 de compras.
- **05c - OCR albaranes**: upload de foto, hash/deduplicación, OCR, matching, cola de revisión y rate limits.

Decisiones específicas:

- `event.confirmed` genera PRs automáticamente en 05a mediante trigger idempotente sobre `v3_domain_events`.
- `event.cancelled` cancela PRs asociadas que sigan en estado no consolidado.
- No se migra data v2 de procurement en 05a; el módulo arranca con datos nuevos sobre `v3_*`.
- La lógica DB toma como referencia el modelo validado en WALL-E; la capa TS/UX se implementa en ChefOS v3.

#### Razón

- PR/PO desbloquea el contrato base de procurement sin esperar a inventory/OCR.
- GR necesita ownership compartido con `inventory`; meterlo en 05a subiría el riesgo y violaría el alcance pequeño del sprint.
- OCR depende de flujo de recepción estable, storage/rate limits y datos reales de alias/proveedor; encaja mejor como 05c.
- Autogenerar PR desde eventos confirmados evita que commercial conozca internals de procurement: la integración vive en eventos de dominio.

#### Consecuencias

- Los contratos públicos de 05a no exportan Goods Receipts ni OCR.
- Las RPCs públicas de 05a llevan prefijo `v3_`.
- La UI inicial se limita a `/procurement`, `/procurement/purchase-requests` y `/procurement/purchase-orders`.
- Los tests de 05a cubren invariantes de dominio, schemas, rutas protegidas y aislamiento cross-tenant PR/PO.
- El criterio de done OCR del doc paraguas se mueve a 05c; no bloquea el cierre de 05a.

#### Revisable

Revisar al iniciar 05b si la consolidación por proveedor necesita enriquecer PR lines con reglas de supplier_config antes de crear Goods Receipts.

---

## Mantenimiento

Cada ADR debe poder leerse en <5 minutos. Si una decisión requiere más, dividirla en varias ADRs.

Revisión trimestral del log para marcar ADRs revisables que ya no aplican.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/specs/agent-responsibilities.md`
- `/.ai/specs/task-execution-order.md`
- `/.ai/WORKFLOW.md`

---

## Estado de esta especificación

Este documento registra las decisiones oficiales de ChefOS v3.

Ninguna decisión estructural vive fuera de este log.
