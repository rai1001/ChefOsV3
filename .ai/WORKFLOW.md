# ChefOS v3 Workflow Oficial

## Objetivo

Este documento define el flujo obligatorio de trabajo para ChefOS v3.

Su propósito es evitar:

- dispersión
- mezcla de tareas
- cambios sin alcance claro
- reutilización caótica de legacy
- cruces no controlados entre módulos
- implementaciones sin validación
- cambios sin documentación actualizada
- ramas, commits, pushes o PRs sin criterio estructurado

Este workflow aplica a desarrollo, migración, refactor, revisión técnica y trabajo asistido por AI.

---

## Principios operativos

1. Se trabaja de una tarea por vez.
2. Cada tarea debe pertenecer a un sprint concreto o a una pieza operativa claramente identificable.
3. Cada tarea debe tener alcance cerrado.
4. No se permite mezclar varios objetivos técnicos en una sola entrega.
5. No se implementa nada sin identificar antes el módulo afectado.
6. No se toca código legacy sin clasificación previa.
7. No se cruza un límite modular sin contrato público definido.
8. No se da por terminado un cambio sin validación estructurada.
9. Los agentes asisten la ejecución, no deciden autónomamente la arquitectura.
10. Toda implementación debe poder revisarse, probarse, documentarse, versionarse y mantenerse.

---

## Secuencia oficial de trabajo

El orden oficial es este:

1. Definir contexto y alcance
2. Identificar módulo afectado
3. Confirmar contrato y límites
4. Evaluar impacto en datos, permisos y tenancy
5. Clasificar si hay legacy reutilizable
6. Especificar cambio
7. Implementar
8. Probar
9. Documentar
10. Versionar en Git con orden
11. Revisar
12. Cerrar contra definition of done

No se debe saltar pasos.

---

## Flujo paso a paso

### 1. Definir contexto y alcance

Antes de tocar código, debe quedar claro:

- cuál es el problema
- cuál es el objetivo exacto
- qué parte del sistema se toca
- qué queda explícitamente fuera

Toda tarea debe tener alcance pequeño y cerrado.

---

### 2. Identificar módulo afectado

Toda tarea debe indicar de forma explícita el módulo principal afectado.

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

Si una tarea afecta a más de un módulo, debe justificarse y dividirse siempre que sea posible.

---

### 3. Confirmar contrato y límites

Antes de implementar, debe quedar claro:

- qué API pública del módulo existe
- qué contrato se mantiene
- qué contrato se crea
- qué dependencias externas intervienen

No se permite acceder a lógica interna de otro módulo sin pasar por contrato público.

---

### 4. Evaluar impacto en datos, permisos y tenancy

Toda tarea debe revisar explícitamente:

- impacto en esquema de datos
- impacto en RLS
- impacto en RPCs
- impacto en Edge Functions
- impacto en permisos
- impacto multi-tenant
- límites funcionales por módulo

Si una tarea no contempla esto cuando aplica, está incompleta.

---

### 5. Clasificar legacy antes de reutilizar

Si existe código previo, debe clasificarse antes de reutilizarse.

Estados permitidos para legacy:

- `reusable`: puede migrarse con cambios mínimos
- `refactor-required`: sirve como referencia pero requiere rediseño parcial
- `extract-only`: solo se rescatan ideas o fragmentos muy concretos
- `discard`: no debe reutilizarse

Reglas:

- no copiar y pegar sin destino claro
- no mover legacy directo a módulos nuevos
- no reutilizar sin adaptar al contrato actual
- no reutilizar sin tests

---

### 6. Especificar el cambio

Antes de implementar, toda tarea debe dejar claro:

- módulo afectado
- archivos a crear o modificar
- contrato afectado
- datos afectados
- tests requeridos
- documentación requerida
- criterio de done aplicable

Si esto no está claro, la tarea no está lista para ejecutarse.

---

### 7. Implementar

La implementación debe respetar la arquitectura oficial:

- `src/app/` solo routing, layout y composición
- `src/features/` módulos de negocio
- `src/lib/` plataforma y concerns compartidos
- `src/components/` UI reutilizable
- `supabase/` lógica de datos, políticas, migraciones y funciones
- `tests/` validación
- `.ai/` documentación operativa

Restricciones:

- no meter lógica de negocio en páginas
- no meter lógica de negocio en componentes compartidos
- no crear acoplamientos laterales entre módulos
- no introducir arquitectura paralela
- no abrir refactors fuera del alcance de la tarea

---

### 8. Probar

Todo cambio debe incluir validación cuando aplique.

Capas de validación posibles:

- unit
- integration
- e2e
- validación de esquema
- validación de permisos
- validación de tenancy
- validación de migración

La ausencia de tests en un cambio que los requiere bloquea el cierre de la tarea.

---

### 9. Documentar

Antes de considerar lista una tarea, debe revisarse si el cambio requiere actualización documental.

Esto incluye, cuando aplique:

- specs
- sprints
- checklists
- prompts
- skills
- contratos públicos
- documentación de módulo
- documentación de migración
- documentación de datos, permisos o tenancy

Reglas:

- no dejar la documentación “para después”
- no cerrar cambios estructurales sin actualizar `.ai/`
- no modificar contratos públicos sin dejar rastro documental
- no operar con decisiones solo implícitas en conversación o PR

---

### 10. Versionar en Git con orden

Una vez que el cambio es coherente, probado y documentado cuando aplica, debe entrar al flujo de Git y GitHub con criterio.

Debe quedar claro:

- qué rama representa el trabajo
- qué commits forman una unidad comprensible
- qué push comparte un estado revisable
- qué PR explica el cambio con contexto suficiente

Reglas:

- no mezclar varias tareas en una rama o PR sin justificación clara
- no usar commits ambiguos o genéricos
- no hacer push de trabajo caótico
- no considerar push como sinónimo de cierre
- no mergear sin revisión estructurada

---

### 11. Revisar

Toda entrega debe pasar por revisión estructurada.

La revisión debe comprobar:

- alcance real vs alcance declarado
- respeto de arquitectura
- respeto de límites modulares
- impacto en datos y seguridad
- calidad del tipado
- calidad de tests
- documentación actualizada cuando aplica
- calidad del flujo de Git y PR
- deuda introducida
- compatibilidad con la definición de done

---

### 12. Cerrar contra definition of done

Una tarea solo se considera cerrada cuando cumple la definición de done aplicable.

No basta con que “funcione”.

Debe cumplir además con:

- estructura correcta
- contratos claros
- tests correctos
- impacto controlado
- documentación actualizada cuando aplica
- revisión completada
- versionado coherente en Git y PR cuando aplica

---

## Reglas de ejecución por tipo de trabajo

### Implementación nueva

Debe partir de:

- módulo identificado
- contrato definido
- datos y permisos revisados
- tests previstos
- documentación prevista cuando aplique

### Refactor

Debe partir de:

- alcance cerrado
- riesgo identificado
- comportamiento esperado protegido por tests
- sin expansión de alcance no autorizada
- impacto documental revisado cuando corresponda

### Migración de legacy

Debe partir de:

- inventario del legacy implicado
- clasificación del material
- destino explícito
- contrato nuevo o existente
- pruebas de regresión cuando aplique
- documentación de migración cuando aplique

### Cambio de base de datos

Debe partir de:

- razón del cambio
- impacto en tenancy
- impacto en RLS
- impacto en RPCs o funciones
- estrategia de migración y validación
- revisión de impacto documental y contractual

---

## Regla de no dispersión

Está prohibido:

- mezclar refactor con feature nueva sin control
- mezclar migración de legacy con rediseño completo en una sola tarea
- tocar módulos no relacionados “ya que estamos”
- corregir deuda lateral fuera del sprint o alcance aprobado
- introducir utilidades globales sin necesidad demostrada
- mezclar varios objetivos en un mismo PR si no forman una sola unidad revisable

---

## Regla de una salida por tarea

Cada tarea debe producir una salida concreta y verificable.

Ejemplos válidos:

- crear spec
- crear checklist
- definir template de módulo
- cerrar migración de una pieza concreta
- implemente contrato de un módulo
- cubrir una ruta de tests definida
- actualizar documentación afectada
- abrir un PR con alcance claro y revisable

Ejemplos no válidos:

- “avanzar bastante”
- “dejar preparada la base”
- “aprovechar para ordenar varias cosas”
- “reestructurar un poco todo”

---

## Plantilla mínima de decisión antes de ejecutar una tarea

Toda tarea debe poder responder estas preguntas:

- ¿qué problema exacto resuelve?
- ¿qué módulo toca?
- ¿qué archivos toca?
- ¿qué contrato toca?
- ¿qué datos o permisos toca?
- ¿hay legacy implicado?
- ¿qué tests la validan?
- ¿qué documentación debe actualizar?
- ¿qué criterio de done la cierra?

Si falta alguna respuesta importante, no debe ejecutarse aún.

---

## Plantilla mínima antes de hacer push o abrir PR

Toda tarea debe poder responder además:

- ¿la rama tiene foco claro?
- ¿los commits son legibles?
- ¿la documentación requerida está incluida?
- ¿los tests requeridos están incluidos?
- ¿el PR será revisable contra alcance, arquitectura y done?

Si la respuesta es no, no debería pasar a PR todavía.

---

## Relación con `.ai/`

Este workflow se apoya en:

- `specs/` para normas permanentes
- `sprints/` para secuencia de ejecución
- `prompts/` para asistencia guiada
- `checklists/` para validación estructurada
- `skills/` para automatización asistida y especializada

---

## Estado de este documento

Este archivo define el flujo oficial de trabajo de ChefOS v3.

Cualquier cambio futuro en el proyecto debe ser compatible con este workflow.
