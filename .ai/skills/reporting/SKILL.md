---
name: reporting
description: ayuda a trabajar una tarea concreta del módulo reporting de chefos v3. úsala cuando haya que definir ownership del módulo, contrato público de reporting, consulta base de reporte, estructura mínima de filtros, salida estructurada mínima, archivos a crear o modificar dentro de src/features/reporting, y validación de permisos, tenancy, tests, documentación y trazabilidad en git. úsala para evitar mezclar reporting con commercial, inventory, production o automation y para impedir acceso caótico al dominio analítico desde páginas o componentes.
---

# ChefOS v3 Reporting

Trabaja solo sobre tareas concretas, cerradas y revisables del módulo `reporting` de ChefOS v3.

Tu función es ayudar a definir, revisar o aterrizar cambios del módulo `reporting` dentro de la arquitectura oficial del proyecto.

No rehagas el dominio de reporting completo.
No mezcles `reporting` con otros módulos.
No abras rediseños generales.
No conviertas `reporting` en contenedor genérico de “cualquier consulta”.

## Base obligatoria del proyecto

Respeta siempre estos documentos del repo:

- `.ai/README.md`
- `.ai/WORKFLOW.md`
- `.ai/specs/architecture.md`
- `.ai/specs/coding-standards.md`
- `.ai/specs/testing-standards.md`
- `.ai/specs/migration-policy.md`
- `.ai/specs/documentation-standards.md`
- `.ai/specs/git-workflow.md`
- `.ai/specs/definition-of-done.md`
- `.ai/specs/module-template.md`
- `.ai/sprints/sprint-08-reporting.md`

## Arquitectura oficial que debes proteger

- `src/app/` para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para control operativo del proyecto

## Ownership del módulo `reporting`

El módulo `reporting` es owner de:

- consulta base de reporting
- estructura mínima de filtros
- salida estructurada mínima del reporte
- agregaciones mínimas del dominio analítico
- validaciones mínimas del dominio de reporting
- contratos públicos que otros módulos necesitan consumir sin invadir internals

El módulo `reporting` no es owner de:

- identidad, sesión o tenant actual
- lógica fuente de `commercial`
- lógica fuente de `inventory`
- lógica fuente de `production`
- automatizaciones genéricas
- integraciones externas como dominio propio
- lógica funcional específica de otros módulos

## Reglas obligatorias

1. No inventes arquitectura nueva.
2. No cambies el stack confirmado.
3. No mezcles varias tareas en una sola respuesta.
4. No invadas ownership de otros módulos.
5. No metas lógica de `reporting` en `src/app/`.
6. No metas lógica de `reporting` en `src/components/`.
7. No uses `src/lib/` como destino por defecto para lógica de reporting.
8. No dupliques lógica fuente de otros módulos dentro de `reporting` si existe contrato público.
9. No ignores permisos, acceso o tenancy cuando apliquen.
10. No cierres una propuesta sin tests suficientes según riesgo.
11. No cierres una propuesta si requería documentación y no queda rastro documental.
12. No cierres una propuesta si no podría entrar a Git y PR con un alcance claro y revisable.

## Modo de trabajo

Cuando se use esta skill, trabaja siempre en este orden:

### 1. Delimitar la tarea

Primero deja explícito:

- objetivo exacto
- alcance permitido
- fuera de alcance
- si toca contrato público o no
- si toca datos, permisos o tenancy
- si hay legacy implicado o no

Si la tarea no está cerrada, responde con la versión más conservadora y mínima compatible con la arquitectura oficial.

### 2. Validar ownership dentro de `reporting`

Debes responder:

- si la tarea pertenece realmente a `reporting`
- si parte del cambio pertenece a otro módulo
- si hace falta contrato público con otro módulo
- qué cosas no deben entrar en este cambio

No permitas que `reporting` absorba lógica ajena por comodidad.

### 3. Validar encaje arquitectónico

Debes ubicar cada parte del cambio en la capa correcta:

- dominio del módulo
- infraestructura del módulo
- UI del módulo
- base de datos, RLS, RPCs o funciones cuando apliquen
- composición en `src/app/` solo si es estrictamente necesario

No propongas una solución si no puedes ubicar con claridad dónde vive cada parte.

### 4. Definir contrato público

Debes dejar claro:

- cuál es la consulta base de reporting afectada
- cuál es su estructura mínima de filtros
- cuál es su salida estructurada mínima
- qué entrada recibe el cambio
- qué salida produce
- qué contrato público usa o crea
- qué dependencias están autorizadas
- qué restricciones de permisos y tenancy aplican

Si no hay contrato claro, no des la propuesta por válida.

### 5. Proponer implementación mínima cerrada

Propón solo la solución mínima suficiente.

Incluye:

- archivos a crear o modificar
- responsabilidad de cada archivo
- orden recomendado de implementación

No abras rediseños generales.
No añadas utilidades globales sin necesidad demostrada.
No metas trabajo lateral “ya que estamos”.

### 6. Definir validación mínima

Debes indicar:

- unit tests necesarios
- integration tests necesarios
- e2e tests necesarios cuando apliquen
- validación de permisos y tenancy cuando apliquen

Relaciona cada test con el riesgo que cubre.

### 7. Definir rastro documental y de Git

Debes indicar, cuando aplique:

- qué documentación debe actualizarse
- si afecta el sprint del módulo
- si cambia contrato público
- cómo debe entrar el cambio a rama, commit y PR sin mezclar otras cosas

No cierres la propuesta si quedaría sin trazabilidad.

### 8. Validar contra definition of done

Cierra siempre con una verificación breve indicando:

- por qué la propuesta respeta arquitectura
- por qué no mezcla tareas
- por qué el alcance está cerrado
- cómo trata permisos y tenancy
- qué criterios de done deben cumplirse antes de darla por terminada

## Formato obligatorio de salida

Responde exactamente con esta estructura:

1. Resumen operativo
2. Ownership dentro de reporting
3. Encaje arquitectónico
4. Contrato público
5. Implementación mínima
6. Tests requeridos
7. Documentación y trazabilidad en Git
8. Riesgos y bloqueos
9. Validación contra definition of done

## Criterio de calidad

Una salida de esta skill solo es válida si:

- deja claro qué pertenece y qué no pertenece a `reporting`
- protege la frontera pública del módulo
- evita acceso disperso al dominio analítico desde cualquier capa
- contempla permisos y multi-tenant de forma explícita
- no abre trabajo lateral en otros módulos
- deja una implementación mínima y revisable
- deja rastro documental y trazabilidad suficiente para revisión
