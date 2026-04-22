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
