# ChefOS v3 Coding Standards

## Objetivo

Este documento define los estándares oficiales de código para ChefOS v3.

Su propósito es asegurar que toda implementación del proyecto sea:

- clara
- mantenible
- tipada
- modular
- revisable
- compatible con la arquitectura oficial
- compatible con testing, documentación, migración y definition of done

Este documento es normativo.

---

## Principios generales

1. El código debe expresar intención con claridad.
2. La implementación debe respetar ownership de módulo.
3. La estructura del código debe seguir la arquitectura oficial del repositorio.
4. Todo cambio debe ser pequeño, trazable y revisable.
5. El tipado debe ser explícito donde aporta seguridad real.
6. La lógica de negocio no debe mezclarse con UI, routing o composición.
7. El código no debe abrir arquitectura paralela ni utilidades sin ownership claro.
8. El código debe poder validarse con tests proporcionales al riesgo.
9. El código debe dejar rastro documental cuando cambie contratos, límites o reglas relevantes.
10. El código no se considera correcto solo porque compila.

---

## Stack y lenguaje

Estándares confirmados del proyecto:

- Next.js
- React
- TypeScript strict
- Supabase
- PostgreSQL
- RLS
- RPCs
- Edge Functions
- TanStack Query
- React Hook Form
- Zod
- Vitest
- Playwright

### Regla crítica

No se debe introducir un patrón que contradiga este stack sin decisión explícita del proyecto.

---

## Arquitectura obligatoria

La estructura oficial del repo es:

- `src/app/` para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para control operativo del proyecto

### Regla crítica

La ubicación del código debe seguir su responsabilidad real.

No se permite resolver por conveniencia lo que debe resolverse por diseño.

---

## Reglas de modularidad

### 1. Ownership claro

Toda pieza de código debe pertenecer claramente a:

- un módulo de negocio
- una capa compartida real
- una pieza de infraestructura
- una pieza UI reutilizable

No debe existir código “de nadie”.

### 2. No mezclar módulos

No se debe meter lógica de un módulo dentro de otro por comodidad.

Si dos módulos necesitan colaborar, la colaboración debe pasar por contrato público.

### 3. No cruzar internals

No se deben consumir internals de otro módulo desde fuera.

Debe exponerse una frontera pública clara.

### 4. No dependencias circulares

No se deben crear dependencias circulares entre módulos o capas.

### 5. No utilidades genéricas sin ownership

Antes de crear helpers, utils o servicios compartidos, debe justificarse:

- por qué son realmente compartidos
- por qué no pertenecen a un módulo concreto
- quién será su owner

---

## Reglas por capa

### `src/app/`

Permitido:

- routing
- layouts
- composición
- wiring mínimo de página

No permitido:

- lógica de negocio
- acceso a datos del dominio sin encapsulación
- reglas operativas del módulo
- validaciones de negocio profundas

### `src/features/`

Permitido:

- dominio del módulo
- casos de uso
- infraestructura del módulo
- componentes específicos del módulo
- contratos públicos del módulo

### `src/lib/`

Permitido:

- concerns compartidos reales
- utilidades de plataforma
- wrappers técnicos compartidos
- piezas transversales justificadas

No permitido:

- dominio escondido
- lógica de negocio de módulo movida aquí por comodidad
- soluciones “temporales” que se vuelven permanentes

### `src/components/`

Permitido:

- UI reutilizable
- componentes presentacionales
- piezas visuales compartidas

No permitido:

- lógica de negocio
- acceso a datos del dominio
- decisiones funcionales específicas de un módulo

### `supabase/`

Permitido:

- migraciones
- políticas RLS
- RPCs
- Edge Functions
- seeds
- lógica de datos y acceso persistente cuando corresponda

No permitido:

- dejar sin documentar impacto en permisos o tenancy cuando aplique

---

## Reglas de TypeScript

### 1. Modo estricto real

El proyecto debe mantenerse en TypeScript strict y el código debe aprovecharlo.

### 2. No abuso de `any`

`any` debe evitarse salvo caso excepcional, justificado y acotado.

No usar `any` para escapar del diseño.

### 3. Tipos explícitos donde importan

Deben tiparse de forma explícita cuando aplique:

- contratos públicos
- inputs y outputs relevantes
- respuestas de datos
- payloads de formularios
- validaciones
- resultados de casos de uso
- estructuras compartidas sensibles

### 4. No tipos ambiguos

Evitar tipos que oculten intención real.

Ejemplos de mala práctica:

- objetos gigantes poco definidos
- uniones mal justificadas
- tipos demasiado amplios
- nombres de tipo vagos

### 5. Zod cuando aplica

Usar Zod para validar inputs externos o fronteras donde el dato entra al sistema cuando tenga sentido.

El tipado no sustituye validación de entrada.

---

## Reglas de naming

### Regla general

Los nombres deben reflejar dominio, intención y responsabilidad.

### Deben evitarse nombres como:

- `data`
- `info`
- `temp`
- `manager`
- `helper`
- `utils`
- `handleStuff`
- `doThing`

salvo que el contexto los justifique de forma muy clara.

### Deben preferirse nombres como:

- `getCurrentTenant`
- `createCommercialAccount`
- `validateRecipeComposition`
- `buildInventorySnapshot`
- `runComplianceCheck`

---

## Reglas de funciones y componentes

### Funciones

Deben ser:

- enfocadas
- legibles
- con responsabilidad clara
- sin mezclar demasiadas decisiones

Evitar funciones gigantes que:

- validan
- consultan
- transforman
- persisten
- renderizan
- notifican

todo a la vez.

### Componentes React

Deben respetar separación entre:

- presentación
- estado de formulario
- acceso a datos
- reglas del dominio

No convertir componentes en contenedores de toda la lógica funcional.

---

## Reglas de formularios

Usar:

- React Hook Form para manejo de formularios
- Zod para esquemas cuando aplique

Los formularios no deben convertirse en el lugar donde vive toda la lógica del dominio.

Deben limitarse a:

- capturar entrada
- validar input de frontera
- delegar al caso de uso o contrato correspondiente

---

## Reglas de acceso a datos

### 1. Acceso encapsulado

No dispersar queries o mutaciones por:

- páginas
- layouts
- componentes compartidos
- múltiples puntos sin ownership

### 2. Contrato antes que acceso directo

Cuando un módulo consume información de otro, debe hacerlo por contrato público y no por atajo técnico.

### 3. Impacto explícito

Si una pieza toca datos, debe revisarse explícitamente:

- esquema
- permisos
- tenancy
- RLS
- RPCs
- Edge Functions

### 4. TanStack Query cuando aplique

Usar TanStack Query para estrategias de fetching, caché e invalidación en cliente cuando corresponda.

No mezclar fetching improvisado en múltiples capas sin criterio.

---

## Reglas de permisos y tenancy

Cuando el cambio lo requiera, el código debe dejar claro:

- quién puede leer
- quién puede crear
- quién puede editar
- quién puede ejecutar
- qué tenant aplica
- qué restricción funcional existe

### Regla crítica

Nunca asumir permisos o multi-tenant de forma implícita.

Si aplica, deben tratarse de forma explícita en código, tests y revisión.

---

## Reglas de legacy

Si se reutiliza código previo, debe respetarse la política de migración.

No se permite:

- copy-paste sin clasificación
- mover estructura antigua al sistema nuevo
- esconder migración dentro de refactor genérico
- reutilizar legacy porque “ahorra tiempo” sin justificar encaje

Toda reutilización de legacy debe tener:

- pieza identificada
- clasificación
- destino claro
- contrato objetivo
- validación suficiente
- documentación cuando aplique

---

## Reglas de comentarios

### Comentarios sí

Usarlos cuando ayudan a explicar:

- una decisión no obvia
- una restricción importante
- un contrato delicado
- una razón arquitectónica concreta

### Comentarios no

No usar comentarios para compensar:

- mala estructura
- nombres pobres
- funciones confusas
- diseño ambiguo

No dejar comentarios tipo:

- `TODO` indefinidos
- `fix later`
- `temporary`
- `hack`
- `magic`

sin contexto claro y sin tratamiento explícito en revisión.

---

## Reglas de documentación asociada al código

El código debe actualizar documentación cuando el cambio altere, por ejemplo:

- contratos públicos
- ownership de módulo
- límites funcionales
- sprint activo
- política de migración
- reglas de permisos o tenancy
- workflow o standards del proyecto

### Regla crítica

Si el cambio requería documentación y no la deja actualizada, el cambio está incompleto.

---

## Reglas de trazabilidad del cambio

Toda implementación debe poder entrar al historial del proyecto con foco claro.

Eso implica que el cambio debe poder agruparse en:

- una rama coherente
- commits legibles
- un PR revisable
- una unidad de cambio comprensible

### Regla crítica

No escribir código que dependa de “luego lo ordenamos en el PR”.

---

## Señales de buen código en ChefOS v3

Se considera una buena implementación cuando:

- la intención es clara
- el ownership está claro
- la capa es correcta
- el contrato es claro
- el tipado protege riesgos reales
- el módulo no invade otros
- el acceso a datos está encapsulado
- permisos y tenancy están tratados cuando aplican
- los tests requeridos existen
- la documentación requerida existe
- la trazabilidad del cambio es clara

---

## Señales de mal código en ChefOS v3

Se consideran señales de mala implementación:

- lógica de negocio en páginas o UI compartida
- helpers genéricos sin owner
- módulos invadiendo otros módulos
- contrato implícito
- tipado débil sin justificación
- `any` usado como escape
- acceso a datos disperso
- permisos asumidos y no validados
- tenancy ignorado
- código que funciona pero no puede revisarse con claridad
- cambio sin documentación cuando la requería
- cambio imposible de agrupar limpiamente en Git y PR

---

## Relación con testing

Código correcto en ChefOS v3 no significa solo código limpio.

También debe ser validable.

Todo cambio debe poder mapearse a tests proporcionales al riesgo.

---

## Relación con Definition of Done

Un cambio no cumple standards de código si:

- está en la capa incorrecta
- rompe ownership modular
- no tiene contrato claro cuando aplica
- ignora permisos o tenancy cuando corresponde
- deja deuda técnica crítica
- omite documentación requerida
- no puede revisarse ni trazarse con claridad

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/migration-policy.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/specs/module-template.md`

---

## Estado de esta especificación

Este documento define los estándares oficiales de código para ChefOS v3.

Toda implementación futura del proyecto debe cumplir estas reglas de modularidad, tipado, ubicación, claridad, validación, documentación y trazabilidad.
