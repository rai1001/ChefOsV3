---
name: chefos-v3-migrate-legacy
description: ayuda a analizar y migrar una pieza legacy concreta hacia la arquitectura oficial de chefos v3. úsala cuando haya que clasificar código previo como reusable, refactor-required, extract-only o discard; decidir módulo y capa destino; definir contrato objetivo; separar qué se rescata y qué se descarta; proponer una migración mínima cerrada; y validar riesgos de permisos, tenancy, datos, tests y documentación. úsala para impedir copy-paste de legacy, movimientos caóticos de carpetas y migraciones sin destino ni validación.
---

# ChefOS v3 Migrate Legacy

Trabaja solo sobre una pieza legacy concreta, cerrada y revisable de ChefOS v3.

Tu función es clasificar, acotar y proponer la migración mínima correcta hacia la arquitectura oficial del proyecto.

No muevas carpetas enteras.
No copies código viejo sin adaptación.
No abras rediseños globales.
No mezcles varias migraciones en una sola respuesta.

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
- `.ai/checklists/migration-checklist.md`

## Arquitectura oficial que debes proteger

- `src/app/` para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para control operativo del proyecto

## Clasificaciones oficiales de legacy

Solo puedes clasificar una pieza en uno de estos estados:

- `reusable`
- `refactor-required`
- `extract-only`
- `discard`

No inventes categorías nuevas.

## Reglas obligatorias

1. No inventes arquitectura nueva para acomodar legacy.
2. No cambies el stack confirmado.
3. No mezcles varias piezas heterogéneas en una sola migración.
4. No toques módulos no relacionados.
5. No copies y pegues código legacy sin adaptación.
6. No muevas carpetas completas como falsa migración.
7. No uses `src/lib/` como destino por defecto por comodidad.
8. No ignores tenancy, permisos o límites funcionales cuando aplican.
9. No des por válida una migración sin contrato objetivo claro.
10. No cierres una propuesta sin validación suficiente según riesgo.
11. No cierres una migración si requería documentación y no queda rastro documental.
12. No cierres una migración si no podría entrar a Git y PR con un alcance claro y revisable.

## Modo de trabajo

Cuando se use esta skill, trabaja siempre en este orden:

### 1. Delimitar la pieza legacy

Primero deja explícito:

- qué pieza exacta se analiza
- dónde vive hoy
- qué comportamiento aporta
- cuál es el alcance exacto de la migración
- qué queda fuera

Si la pieza es demasiado grande, reduce el análisis a la unidad mínima razonable.

### 2. Clasificar la pieza

Debes clasificarla en uno de estos estados:

- `reusable`
- `refactor-required`
- `extract-only`
- `discard`

La clasificación debe quedar justificada.

No clasifiques por intuición vaga.
Clasifica según encaje arquitectónico, deuda, tipado, acoplamiento, permisos, tenancy y costo de adaptación.

### 3. Validar módulo y capa destino

Debes responder:

- qué módulo debe ser owner del resultado
- en qué capa debe vivir
- qué partes no deben migrarse
- si el destino propuesto es correcto o no
- qué cosas no deben hacerse para no contaminar la arquitectura

No permitas que la estructura vieja decida la arquitectura nueva.

### 4. Definir contrato objetivo

Debes dejar claro:

- qué entrada recibe la pieza migrada
- qué salida produce
- qué contrato público usa o crea
- qué dependencias están autorizadas
- qué restricciones de permisos y tenancy aplican

Si no hay contrato claro, no des la migración por válida.

### 5. Proponer estrategia mínima de migración

Propón solo la migración mínima suficiente.

Incluye:

- qué se rescata realmente
- qué se descarta
- qué se refactoriza
- archivos a crear o modificar
- responsabilidad de cada archivo
- orden recomendado de migración

No abras rediseños generales.
No añadas utilidades globales sin necesidad demostrada.
No conviertas la migración en limpieza masiva del repo.

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
- dónde debe quedar la clasificación de la pieza
- dónde debe quedar el contrato objetivo
- cómo debe entrar el cambio a rama, commit y PR sin mezclar otras cosas

No cierres la propuesta si la migración quedaría sin trazabilidad.

### 8. Validar contra definition of done

Cierra siempre con una verificación breve indicando:

- por qué la propuesta no es simple copia
- por qué el destino es correcto
- por qué el alcance está cerrado
- qué criterios de done deben cumplirse antes de darla por terminada

## Formato obligatorio de salida

Responde exactamente con esta estructura:

1. Resumen de la pieza legacy
2. Clasificación
3. Módulo y capa destino
4. Contrato objetivo
5. Estrategia mínima de migración
6. Tests requeridos
7. Documentación y trazabilidad en Git
8. Riesgos y bloqueos
9. Validación contra definition of done

## Criterio de calidad

Una salida de esta skill solo es válida si:

- evita copy-paste de legacy
- clasifica con claridad y sin ambigüedad
- define destino correcto dentro de la arquitectura oficial
- no abre rediseños globales
- deja claro qué se migra y qué no
- explicita riesgos de datos, permisos y tenancy cuando aplican
- define validación suficiente según riesgo
- deja rastro documental y trazabilidad suficiente para revisión
