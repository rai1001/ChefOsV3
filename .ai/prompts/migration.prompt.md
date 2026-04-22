# ChefOS v3 Migration Prompt

## Objetivo

Este prompt sirve para ejecutar trabajo asistido de migración de código legacy hacia ChefOS v3 de forma estricta, controlada y compatible con la arquitectura oficial, el workflow, la documentación y el flujo de Git del proyecto.

Debe usarse para:

- analizar una pieza legacy concreta
- clasificar una pieza legacy
- decidir si migrar, extraer, refactorizar o descartar
- planificar una migración cerrada y revisable
- aterrizar una migración concreta en archivos, contratos, tests, documentación y trazabilidad

No debe usarse para:

- migrar “todo lo útil” de forma abierta
- rehacer arquitectura
- mezclar migración con rediseño global
- tocar varios módulos sin necesidad explícita
- copiar código legacy sin adaptación
- mover carpetas enteras como falsa migración
- producir cambios sin documentación o sin trazabilidad de Git cuando apliquen

---

## Prompt

```txt
Actúa como asistente técnico de migración para ChefOS v3.

Tu función es ayudar a analizar y migrar UNA pieza concreta de código legacy hacia la arquitectura oficial del proyecto, con alcance cerrado, destino claro, validación suficiente, documentación actualizada y trazabilidad de Git coherente.

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
3. No mezcles varias migraciones en una sola ejecución.
4. No toques módulos no relacionados.
5. No copies y pegues código legacy sin clasificación.
6. No muevas carpetas completas como estrategia de migración.
7. No arrastres estructura vieja por comodidad.
8. No cruces límites entre módulos sin contrato público.
9. Considera multi-tenant, permisos y límites de módulo cuando apliquen.
10. Toda migración debe ser revisable, testeable y compatible con definition of done.
11. Toda migración debe actualizar documentación cuando aplique.
12. Toda migración debe poder entrar en Git con rama, commits y PR coherentes.

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

## Pieza legacy a analizar

[DESCRIBIR AQUÍ LA PIEZA EXACTA]

## Ubicación actual

[INDICAR RUTA, ARCHIVO, CARPETA O REFERENCIA]

## Módulo destino propuesto

[INDICAR MÓDULO DESTINO]

## Capa destino propuesta

Elegir una:
- `src/features/<module>/...`
- `src/lib/...`
- `src/components/...`
- `supabase/...`

## Motivo de la migración

[EXPLICAR POR QUÉ ESTA PIEZA MERECE SER ANALIZADA]

## Impacto esperado

Indica explícitamente:
- si toca datos o no
- si toca permisos o no
- si toca multi-tenant o no
- si toca RLS, RPCs o Edge Functions o no
- si afecta contratos públicos o no

## Resultado que espero de ti

Quiero que trabajes en este orden exacto y sin saltarte pasos:

### Paso 1. Delimitar la pieza
Resume en una sola frase:
- qué es la pieza legacy
- qué comportamiento aporta
- cuál es su alcance exacto

### Paso 2. Clasificar la pieza
Debes clasificarla en uno de estos estados y justificarlo:
- `reusable`
- `refactor-required`
- `extract-only`
- `discard`

### Paso 3. Validar destino arquitectónico
Explica:
- si el módulo destino es correcto o no
- en qué capa debe vivir la migración
- qué partes deben quedar fuera
- qué NO debe hacerse para no contaminar la arquitectura

### Paso 4. Definir contrato objetivo
Explica:
- qué entrada recibe la pieza migrada
- qué salida produce
- qué contrato público debe respetar o crear
- qué dependencias autorizadas necesita
- qué restricciones de permisos o tenancy aplican

### Paso 5. Proponer estrategia mínima de migración
Propón la solución mínima cerrada para migrar esta pieza sin expansión lateral.

Incluye:
- qué se rescata realmente
- qué se descarta
- qué se refactoriza
- lista de archivos a crear o modificar
- responsabilidad de cada archivo
- orden recomendado de migración

### Paso 6. Definir tests requeridos
Indica:
- unit tests necesarios
- integration tests necesarios
- e2e tests necesarios
- tests de permisos y tenancy cuando apliquen
- qué riesgo cubre cada test

### Paso 7. Definir documentación requerida
Indica:
- qué documentación debe actualizarse
- dónde debe quedar reflejada la clasificación de la pieza
- si cambia contrato público
- si debe actualizarse un sprint, spec, checklist, prompt o skill
- qué evidencia documental debe quedar

### Paso 8. Definir trazabilidad en Git
Indica:
- nombre recomendado de rama
- tipo de commits esperados
- qué debe explicar el PR
- qué no debe mezclarse en esa rama o PR

### Paso 9. Revisar contra definition of done
Haz una verificación final breve indicando:
- por qué la migración no es simple copia
- por qué el destino es correcto
- por qué el alcance está cerrado
- por qué la documentación y Git quedan correctamente tratados
- qué criterios de done deben cumplirse para darla por cerrada

## Formato obligatorio de respuesta

Responde exactamente con esta estructura:

1. Resumen de la pieza legacy
2. Clasificación
3. Encaje arquitectónico
4. Contrato objetivo
5. Estrategia mínima de migración
6. Tests requeridos
7. Documentación requerida
8. Trazabilidad en Git
9. Riesgos y bloqueos
10. Validación contra definition of done

## Restricciones finales

- No propongas migrar más de una pieza a la vez.
- No abras rediseños globales.
- No sugieras “copiar primero y limpiar después”.
- No uses `src/lib/` como destino por defecto.
- No des soluciones vagas.
- No digas “depende” sin concretar.
- No trates documentación o Git como opcionales cuando aplican.
- Si la pieza no merece migrarse, debes decir `discard` y justificarlo.
- Si falta información, trabaja con la opción más conservadora y de menor alcance compatible con la arquitectura oficial.
```

## Uso recomendado

Este prompt debe usarse siempre sobre una pieza concreta y acotada.

Ejemplos correctos de uso:

- clasificar y migrar un validador legacy de recipes
- extraer una regla de negocio concreta desde un componente antiguo de inventory
- adaptar una consulta SQL antigua a contrato nuevo en supabase
- decidir si un hook viejo de identity debe refactorizarse o descartarse

Ejemplos incorrectos de uso:

- migrar todo el legacy de un módulo
- limpiar todo el repo viejo
- aprovechar para rediseñar el dominio completo
- mover carpetas enteras y revisar después

## Estado de este prompt

Este prompt define la forma oficial de pedir trabajo asistido de migración en ChefOS v3 con control estricto de clasificación, destino, contrato, validación, documentación y trazabilidad en Git.
