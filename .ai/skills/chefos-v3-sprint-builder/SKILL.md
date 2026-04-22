---
name: chefos-v3-sprint-builder
description: ayuda a convertir un objetivo del proyecto chefos v3 en un sprint pequeño, cerrado y revisable. úsala cuando haya que definir nombre de sprint, objetivo exacto, alcance incluido, fuera de alcance, módulo principal, tareas cerradas, riesgos, dependencias y criterios de cierre. úsala para evitar mezclar varias iniciativas en un mismo sprint, impedir expansión lateral, aterrizar trabajo por módulo y validar que el sprint sea compatible con la arquitectura oficial, el workflow y la definition of done del proyecto.
---

# ChefOS v3 Sprint Builder

Trabaja solo sobre objetivos concretos, cerrados y planificables de ChefOS v3.

Tu función es convertir una necesidad del proyecto en un sprint pequeño, claro y ejecutable dentro del sistema operativo interno definido en `.ai/`.

No planifiques todo el roadmap de una vez.
No mezcles varios objetivos grandes en el mismo sprint.
No conviertas un sprint en una lista vaga de ideas.
No uses un sprint como excusa para tocar varios módulos sin control.

## Base obligatoria del proyecto

Respeta siempre estos documentos del repo:

- `.ai/README.md`
- `.ai/WORKFLOW.md`
- `.ai/specs/architecture.md`
- `.ai/specs/coding-standards.md`
- `.ai/specs/testing-standards.md`
- `.ai/specs/migration-policy.md`
- `.ai/specs/definition-of-done.md`
- `.ai/specs/module-template.md`

## Arquitectura y forma de trabajo que debes proteger

- `src/app/` para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` para unit, integration y e2e
- `.ai/` para control operativo del proyecto

## Reglas obligatorias

1. No inventes arquitectura nueva.
2. No cambies el stack confirmado.
3. No mezcles varios objetivos grandes en un mismo sprint.
4. No uses un sprint para “avanzar varias cosas”.
5. No toques módulos no relacionados sin justificación explícita.
6. No conviertas migraciones amplias en una sola tarea difusa.
7. No ignores permisos, multi-tenant o límites modulares cuando apliquen.
8. No propongas tareas ambiguas o no verificables.
9. No cierres un sprint sin entregables concretos.
10. Todo sprint debe poder revisarse contra definition of done.

## Modo de trabajo

Cuando se use esta skill, trabaja siempre en este orden:

### 1. Delimitar el objetivo del sprint

Primero deja explícito:

- objetivo exacto
- módulo principal o naturaleza transversal
- alcance deseado
- dependencias previas
- fuera de alcance

Si el objetivo es demasiado grande, redúcelo a la versión más pequeña y cerrada compatible con la arquitectura oficial.

### 2. Validar si el sprint está bien acotado

Debes responder:

- si el objetivo cabe en un solo sprint
- si mezcla varios dominios o no
- si necesita partirse
- qué cosas no deben entrar
- qué riesgos de expansión lateral existen

No des por válido un sprint que en realidad contiene varias iniciativas distintas.

### 3. Definir foco y ownership

Debes dejar claro:

- qué módulo es el foco real
- qué módulos no deben tocarse
- qué dependencias mínimas están permitidas
- si el sprint es transversal o de módulo
- qué ownership funcional domina el alcance

No permitas que el sprint diluya responsabilidades entre módulos.

### 4. Construir tareas cerradas

Debes proponer solo tareas pequeñas, concretas y verificables.

Cada tarea debe dejar claro:

- objetivo
- salida esperada
- si toca contrato, datos, permisos o tenancy
- qué la cierra

No incluyas tareas vagas como:

- “ordenar base”
- “dejar preparado”
- “avanzar varias piezas”
- “reorganizar un poco todo”

### 5. Definir entregables y criterios de cierre

Debes dejar claro:

- qué archivos, contratos, decisiones o artefactos deben existir al cierre
- qué significa que el sprint esté terminado
- qué evidencia concreta lo demuestra
- qué haría que el sprint no sea aprobable

### 6. Definir riesgos y bloqueos

Debes indicar:

- riesgos de mezcla de tareas
- riesgos de expansión lateral
- riesgos de arquitectura
- riesgos de permisos, tenancy o datos cuando apliquen
- bloqueos estructurales previsibles

### 7. Validar contra definition of done

Cierra siempre con una verificación breve indicando:

- por qué el sprint tiene alcance cerrado
- por qué no mezcla trabajo heterogéneo
- por qué es compatible con la arquitectura oficial
- qué condiciones deben cumplirse para darlo por cerrado

## Formato obligatorio de salida

Responde exactamente con esta estructura:

1. Nombre del sprint
2. Objetivo del sprint
3. Alcance incluido
4. Fuera de alcance
5. Módulo o foco principal
6. Tareas cerradas del sprint
7. Riesgos y bloqueos
8. Criterios de cierre
9. Validación contra definition of done

## Criterio de calidad

Una salida de esta skill solo es válida si:

- reduce ambigüedad
- convierte el objetivo en un sprint realmente pequeño
- evita mezclar varias iniciativas
- deja tareas verificables
- protege límites modulares
- explicita riesgos de datos, permisos y tenancy cuando aplican
- deja claro qué no debe tocarse
