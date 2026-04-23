# ChefOS v3 Sprint 01 - Identity

## Objetivo del sprint

Construir la base funcional inicial del módulo `identity` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a resolver identidad, sesión, tenant actual y control de acceso base como contratos del sistema.

Este sprint no existe para resolver toda la seguridad del producto.

Existe para definir y estabilizar la primera base operativa del módulo `identity`.

---

## Estado del sprint

- Módulo principal: `identity`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencia directa: `sprint-00-foundation`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `identity`

El módulo `identity` es responsable de la identidad operativa dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- sesión autenticada
- usuario actual
- tenant actual
- contexto de acceso
- permisos base
- resolución del contexto de identidad necesario para otros módulos

No debe convertirse en owner de lógica de negocio ajena.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `identity` para que el resto del sistema pueda conocer, de forma explícita y controlada:

- quién es el usuario actual
- a qué tenant pertenece
- qué contexto de acceso tiene
- qué comprobaciones base de permiso deben existir
- cómo consumir este contexto sin invadir internals

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `identity` que permita:

- encapsular la resolución de sesión y tenant actual
- exponer contratos públicos del módulo
- evitar acceso caótico a identidad desde páginas o componentes
- preparar el terreno para permisos por módulo
- permitir que futuros módulos consuman `identity` mediante contrato público

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `identity`
- definición de frontera pública del módulo
- definición de contratos base de identidad
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la resolución de usuario, sesión y tenant actual
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- implementación completa de todos los roles del sistema
- sistema completo de autorización avanzada
- rediseño global de auth
- implementación transversal de permisos de todos los módulos
- migración masiva de código legacy de auth
- cambios funcionales en módulos no relacionados
- flujos completos de backoffice fuera del alcance de `identity`

---

## Módulo afectado

- `identity`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
- inventory
- production
- reporting
- compliance
- automation
- notifications
- integrations
- hr
- agents

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `identity`.
2. Evitar acceso improvisado a sesión o tenant desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que identidad, tenant y permisos base se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el sistema de permisos definitivo.
2. Todo la administración de usuarios.
3. Toda la experiencia de login del producto.
4. Toda la jerarquía organizativa futura.
5. Integraciones externas complejas relacionadas con identidad.
6. Reestructuración global de módulos consumidores.

---

## Dependencias del sprint

Este sprint depende de que Sprint 00 ya haya dejado cerrados:

- workflow oficial
- arquitectura oficial
- standards de código
- standards de testing
- política de migración
- definition of done
- plantilla oficial de módulos

---

## Entregables del sprint

Los entregables esperados de Sprint 01 son los mínimos necesarios para dejar una base estable del módulo `identity`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- sesión actual
- usuario actual
- tenant actual
- contexto de acceso base
- verificación base de permisos cuando aplique

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/identity/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato de identidad
- resolución de tenant actual
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 01 solo se considera cerrado cuando:

1. `identity` tiene responsabilidad funcional clara.
2. Existe frontera pública clara del módulo.
3. Sesión, usuario y tenant actual no dependen de acceso caótico desde UI o páginas.
4. El contrato base del módulo está definido con claridad.
5. Permisos y tenancy fueron tratados explícitamente.
6. El sprint no mezcló trabajo de otros módulos.
7. Hay validación suficiente según riesgo.
8. El resultado deja base real para módulos posteriores.

---

## Tareas del sprint

### Tarea 01.01 - Definir responsabilidad exacta del módulo identity

Objetivo:

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

Salida esperada:

- definición cerrada del alcance del módulo

### Tarea 01.02 - Definir contrato público base de identity

Objetivo:

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

Salida esperada:

- contrato público base documentado o implementado

### Tarea 01.03 - Resolver sesión, usuario y tenant actual mediante contrato claro

Objetivo:

- definir la forma oficial de obtener contexto actual
- impedir accesos dispersos desde múltiples capas

Salida esperada:

- punto de entrada claro para contexto de identidad actual

### Tarea 01.04 - Definir restricciones base de acceso

Objetivo:

- identificar comprobaciones mínimas de permisos base
- dejar claro qué validaciones pertenecen a identity

Salida esperada:

- reglas base de acceso asociadas al módulo

### Tarea 01.05 - Validar tenancy y permisos del contrato base

Objetivo:

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados

Salida esperada:

- cobertura mínima de validación para tenancy y acceso

### Tarea 01.06 - Revisar el módulo contra arquitectura y definition of done

Objetivo:

- asegurar que identity queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

Salida esperada:

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la seguridad del sistema

Mitigación:

- limitar el sprint a contrato base de identidad, tenant y acceso inicial

### Riesgo 2. Mezclar identity con lógica de otros módulos

Mitigación:

- mantener ownership estricto
- no introducir permisos funcionales específicos de otros dominios

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

Mitigación:

- exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir identidad

Mitigación:

- tratar tenant actual como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de identidad en páginas, layouts o componentes

Mitigación:

- concentrar la lógica del módulo en `src/features/identity/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 01, debe poder responderse:

- ¿está claro qué pertenece a identity?
- ¿el resto del sistema puede consumir identity sin invadir internals?
- ¿usuario actual, sesión y tenant actual tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 01 no está cerrado.

---

## Definition of Done del sprint

Sprint 01 está done solo cuando:

- el módulo identity tiene frontera clara
- el contrato base del módulo existe y es comprensible
- sesión, usuario y tenant actual están tratados como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 01, el proyecto debería quedar listo para que otros módulos consuman identity con un contrato estable, en lugar de resolver contexto de acceso de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 01 oficial del módulo `identity` en ChefOS v3.

**Estado: CERRADO (2026-04-21)**.

### Resumen de implementación

- Módulo `src/features/identity/` con estructura DDD completa:
  - `domain/` — Role enum (13), ROLE_TO_PROFILE, Hotel/Membership/Profile/Tenant tipos, PERMISSIONS matrix (19 permisos), errors (NotAuthenticatedError, NoActiveHotelError, InsufficientRoleError).
  - `application/` — 5 client hooks (useCurrentUser, useActiveHotel, useUserHotels, useSwitchHotel, useSignOut) + 2 server helpers (getCurrentUser, getActiveHotel, ambos con variantes `*OrNull`).
  - `infrastructure/identity-queries.ts` — 3 adapters Supabase (get_active_hotel, get_user_hotels, switch_active_hotel).
  - `application/schemas.ts` — 4 Zod schemas (signIn, signUp, forgotPassword, resetPassword).
  - **Dos entry points**: `index.ts` (client-safe) y `server.ts` (server-only).

- Páginas auth en `src/app/(auth)/`:
  - `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/callback`.
  - Todas las mutations usan Server Actions + Zod.

- Dashboard protegido en `src/app/(app)/`:
  - `layout.tsx` — guard server: carga user + active hotel o redirect a `/login`/`/no-access`.
  - `page.tsx` — saludo + hotel activo + switcher + logout.

- Shell components:
  - `HotelSwitcher` (Radix DropdownMenu + useSwitchHotel).
  - `LogoutButton`.
  - `UserBadge`.

- Proxy endurecido: strict en producción, pass-through con warning en dev/test.

- Testing:
  - 21 tests unit (domain invariants + permissions + utils existentes).
  - 3 E2E activos sin Supabase (smoke + auth-proxy).
  - 3 E2E gated por env vars (auth-login, auth-signup, auth-forgot-reset).
  - `e2e/global-setup.ts` crea test user idempotente via service_role.

- ADRs registradas:
  - **ADR-0006** — `hotel_id` es el identificador de tenant en ChefOS.
  - **ADR-0007** — Onboarding fuera de sprint-01.

### Verificación final

| Check                             | Resultado                 |
| --------------------------------- | ------------------------- |
| `npm run typecheck`               | 0 errores                 |
| `npm run lint`                    | 0 errores, 0 warnings     |
| `npm run test`                    | 21/21 passed              |
| `npm run build`                   | 9 rutas generadas OK      |
| `npm run test:e2e` (sin Supabase) | smoke + auth-proxy verdes |

### Checklist de cierre

- [x] `identity` tiene responsabilidad funcional clara.
- [x] Frontera pública vía `index.ts` (client) + `server.ts` (server).
- [x] Sesión, usuario y hotel activo no viven en UI/páginas.
- [x] Contrato base documentado (este archivo + comentarios en `index.ts`).
- [x] Permisos y tenancy tratados: matriz `PERMISSIONS` + RLS Supabase heredada v2.
- [x] Sprint no mezcló trabajo de otros módulos.
- [x] Validación suficiente (unit + E2E).
- [x] Base para sprints posteriores lista.

Siguiente: **sprint-02-commercial** — eventos comerciales consumirán `features/identity` por contrato público.
