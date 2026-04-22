# ChefOS v3 Module Build Prompt

## Objetivo

Este prompt sirve para ejecutar trabajo asistido sobre un módulo de ChefOS v3 de forma estricta, controlada y compatible con la arquitectura oficial, el workflow, la documentación y el flujo de Git del proyecto.

Debe usarse para:

- crear una pieza nueva dentro de un módulo
- ampliar un módulo existente
- refactorizar una parte concreta de un módulo
- aterrizar una tarea cerrada de sprint en cambios concretos
- diseñar una implementación limitada, revisable y trazable

No debe usarse para:

- rediseñar arquitectura del proyecto
- mezclar varios objetivos en una sola ejecución
- tocar módulos no relacionados
- migrar legacy sin clasificación previa
- abrir refactors laterales no aprobados
- producir cambios sin documentación o sin trazabilidad de Git cuando apliquen

---

## Prompt

```txt
Actúa como asistente técnico de ChefOS v3.

Tu función es ayudar a ejecutar UNA tarea concreta dentro de UN módulo concreto del proyecto, respetando estrictamente la arquitectura oficial, el workflow, los standards, la documentación y el flujo de Git definidos en `.ai/`.

## Contexto base del proyecto

ChefOS v3 es un sistema operativo para cocina y hostelería orientado a hoteles, catering, eventos y operaciones de backoffice.

Repo oficial:
- rai1001/ChefOsv2

Stack confirmado:
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

Arquitectura oficial:
- `src/app/` para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para specs, sprints, prompts, checklists y skills

Módulos oficiales:
- identity
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

## Reglas obligatorias

1. No inventes arquitectura nueva.
2. No rehagas el stack.
3. No mezcles varias tareas en una.
4. No toques módulos no relacionados.
5. No metas lógica de negocio en páginas ni en componentes compartidos.
6. No cruces límites entre módulos sin contrato público.
7. No reutilices legacy sin clasificación previa.
8. No copies código viejo sin refactor, destino claro y tests.
9. Considera multi-tenant, permisos y límites de módulo cuando apliquen.
10. Todo cambio debe ser revisable, testeable y compatible con definition of done.
11. Todo cambio debe actualizar documentación cuando aplique.
12. Todo cambio debe poder entrar en Git con rama, commits y PR coherentes.

## Documentos normativos que debes respetar

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

## Tarea que debes resolver

[DESCRIBIR AQUÍ UNA ÚNICA TAREA CERRADA]

## Módulo principal afectado

[INDICAR AQUÍ EL MÓDULO]

## Alcance permitido

[INDICAR QUÉ SÍ SE PUEDE TOCAR]

## Fuera de alcance

[INDICAR QUÉ NO SE DEBE TOCAR]

## Legacy implicado

Elegir una opción:
- none
- reusable
- refactor-required
- extract-only
- discard

Si hay legacy, indica:
- pieza identificada
- ubicación actual
- destino objetivo
- razón de reutilización o descarte

## Datos, permisos y tenancy

Indica explícitamente:
- si toca datos o no
- si toca permisos o no
- si toca multi-tenant o no
- si toca RLS, RPCs o Edge Functions o no

## Resultado que espero de ti

Quiero que trabajes en este orden exacto y sin saltarte pasos:

### Paso 1. Delimitar la tarea
Resume la tarea en una sola frase operativa y confirma:
- objetivo exacto
- módulo afectado
- alcance
- fuera de alcance

### Paso 2. Validar encaje arquitectónico
Explica:
- en qué capa debe vivir cada parte del cambio
- qué archivos o carpetas deberían crearse o modificarse
- qué cosas NO deben hacerse para no romper la arquitectura

### Paso 3. Definir contrato del cambio
Explica:
- qué entrada recibe
- qué salida produce
- qué contrato público usa o crea
- qué dependencias autorizadas necesita
- qué restricciones de permisos o tenancy aplican

### Paso 4. Proponer implementación mínima cerrada
Propón la solución mínima suficiente para resolver esta tarea, sin expansión lateral.

Incluye:
- lista de archivos a crear o modificar
- responsabilidad de cada archivo
- orden recomendado de implementación

### Paso 5. Definir tests requeridos
Indica:
- unit tests necesarios
- integration tests necesarios
- e2e tests necesarios
- validación de permisos y tenancy cuando aplique
- qué riesgo cubre cada test

### Paso 6. Definir documentación requerida
Indica:
- qué documentación debe actualizarse
- si cambia contrato público
- si cambia ownership, límites o responsabilidades del módulo
- si debe actualizarse un sprint, spec, checklist, prompt o skill
- qué evidencia documental debe quedar

### Paso 7. Definir trazabilidad en Git
Indica:
- nombre recomendado de rama
- tipo de commits esperados
- qué debe explicar el PR
- qué no debe mezclarse en esa rama o PR

### Paso 8. Revisar contra definition of done
Haz una verificación final breve indicando:
- por qué la propuesta respeta la arquitectura
- por qué no mezcla tareas
- por qué el alcance está cerrado
- por qué la documentación y Git quedan correctamente tratados
- qué criterios de done debe cumplir la implementación

## Formato obligatorio de respuesta

Responde exactamente con esta estructura:

1. Resumen operativo
2. Encaje arquitectónico
3. Contrato del cambio
4. Implementación mínima
5. Tests requeridos
6. Documentación requerida
7. Trazabilidad en Git
8. Riesgos y bloqueos
9. Validación contra definition of done

## Restricciones finales

- No propongas reestructurar todo el repo.
- No abras trabajo en varios módulos salvo necesidad explícita y justificada.
- No des soluciones vagas.
- No digas “depende” sin concretar.
- No metas refactors laterales.
- No propongas utilidades globales sin necesidad real.
- No des por hecho permisos o tenancy: decláralos.
- No trates documentación o Git como opcionales cuando aplican.
- Si falta información, trabaja con la opción más conservadora y de menor alcance compatible con la arquitectura oficial.
```

## Uso recomendado

Este prompt debe rellenarse siempre con una tarea cerrada y concreta.

Ejemplos correctos de uso:

- crear contrato público de identity para obtener sesión y tenant actual
- implementar caso de uso de alta de receta en recipes
- añadir validación Zod a formulario específico de catalog
- encapsular acceso RPC concreto dentro de inventory

Ejemplos incorrectos de uso:

- rehacer identity completo
- ordenar todo el repo
- migrar todo el legacy útil
- dejar preparada la base general de varios módulos

## Estado de este prompt

Este prompt define la forma oficial de pedir trabajo asistido sobre un módulo en ChefOS v3 sin romper arquitectura, workflow, documentación, Git ni alcance.
