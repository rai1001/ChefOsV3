# ChefOS v3 Documentation Standards

## Objetivo

Este documento define los estándares oficiales de documentación para ChefOS v3.

Su propósito es asegurar que el proyecto mantenga una base documental útil, consistente y operativa, evitando:

- documentación dispersa
- documentación desactualizada
- cambios sin rastro documental
- contratos implícitos no escritos
- decisiones arquitectónicas no registradas
- sprints o migraciones sin contexto verificable
- README decorativos sin valor operativo

Este documento es normativo.

---

## Principios generales

1. La documentación debe servir para operar el proyecto, no para decorar el repo.
2. La documentación debe ser concreta, mantenible y versionable.
3. Todo cambio relevante debe dejar evidencia documental cuando aplique.
4. No se documenta por cantidad, se documenta por claridad y utilidad.
5. La documentación debe mantenerse alineada con la arquitectura oficial.
6. La documentación del proyecto vive principalmente en `.ai/`.
7. La documentación no sustituye código claro, contratos claros ni tests.
8. Nada importante debe depender solo de contexto oral o memoria de conversación.
9. Si una decisión afecta arquitectura, módulo, contrato, migración o workflow, debe quedar escrita.
10. La documentación desactualizada es deuda y debe tratarse como tal.

---

## Qué se considera documentación oficial en ChefOS v3

La documentación oficial del proyecto incluye, como mínimo:

- manifiesto base del proyecto
- workflow oficial
- specs normativas
- sprints
- prompts operativos
- checklists
- skills
- documentación de módulo cuando aplique
- documentación de contratos cuando aplique
- documentación de migración cuando aplique
- documentación de decisiones relevantes cuando aplique

La documentación oficial no debe repartirse sin criterio en archivos sueltos.

---

## Ubicación oficial de la documentación

### `.ai/`

`.ai/` es la capa principal de documentación operativa del proyecto.

Aquí deben vivir:

- reglas
- standards
- workflow
- sprints
- checklists
- prompts
- skills
- definiciones operativas del sistema

### Dentro de módulos o capas del repo

La documentación cercana al código solo debe existir cuando aporte contexto técnico directo y mantenible.

Ejemplos válidos:

- documentación de contrato público
- documentación de módulo si es realmente útil
- notas técnicas necesarias para uso o mantenimiento local
- README local de módulo si tiene un propósito claro

### No válido

- duplicar en varios sitios la misma regla
- crear READMEs vacíos o genéricos
- dejar documentación suelta sin ownership
- usar comentarios largos como sustituto de documentación estructurada

---

## Regla de documentación por tipo de cambio

### 1. Cambio arquitectónico

Debe actualizar, como mínimo, la spec relevante en `.ai/specs/`.

Si cambia la forma oficial de construir, ubicar o conectar piezas del sistema, debe reflejarse en documentos normativos.

### 2. Cambio de workflow

Debe actualizar `/.ai/WORKFLOW.md` y, si aplica, checklists o prompts relacionados.

### 3. Cambio de módulo

Debe actualizar la documentación del sprint, contrato o módulo cuando el cambio:

- modifica ownership
- cambia contratos públicos
- altera límites
- añade nuevas responsabilidades
- redefine fuera de alcance

### 4. Cambio de contrato

Debe dejar claro:

- qué entra
- qué sale
- qué módulo es owner
- qué consumidores pueden usarlo
- qué restricciones tiene

Si el contrato cambia y no queda documentado donde corresponde, el cambio está incompleto.

### 5. Migración de legacy

Debe dejar por escrito, cuando aplique:

- pieza migrada
- clasificación
- destino
- contrato objetivo
- qué se reutilizó
- qué se descartó
- qué validación protege la migración

### 6. Cambio de base de datos o acceso

Debe dejar documentado, cuando aplique:

- impacto en datos
- impacto en tenancy
- impacto en permisos
- impacto en RLS
- impacto en RPCs o Edge Functions
- impacto en contratos consumidores

### 7. Sprint nuevo o cambio de planificación

Debe quedar reflejado en `/.ai/sprints/`.

No se deben operar fases del proyecto solo con contexto implícito.

---

## Regla de documentación mínima obligatoria

Todo cambio relevante debe poder responder documentalmente:

- qué se cambió
- por qué se cambió
- qué módulo toca
- qué contrato toca
- qué queda fuera
- qué evidencia valida el cambio
- qué documento del proyecto quedó afectado

Si no puede responderse con claridad, falta documentación.

---

## Qué debe documentarse siempre

Debe documentarse siempre cuando aplique:

- arquitectura oficial
- workflow oficial
- definition of done
- standards de código
- standards de testing
- política de migración
- plantilla de módulo
- sprints
- reglas de revisión
- skills internas
- cambios de contrato público
- cambios de ownership
- reglas de permisos o tenancy relevantes
- decisiones que afecten cómo se construye o revisa el proyecto

---

## Qué no debe documentarse de forma pesada o innecesaria

No debe generarse documentación redundante para:

- cambios triviales de texto
- refactors internos sin cambio de contrato ni de operación relevante
- detalles obvios que ya quedan claros en código bien estructurado
- listados decorativos sin valor operativo
- descripciones genéricas que no ayudan a ejecutar ni revisar

---

## Reglas de calidad de documentación

La documentación de ChefOS v3 debe ser:

### 1. Explícita

Debe decir claramente qué regla, decisión o contrato existe.

### 2. Operativa

Debe servir para construir, revisar, migrar o cerrar trabajo real.

### 3. Versionable

Debe poder evolucionar con el repo y revisarse en cambios concretos.

### 4. Consistente

No debe contradecir documentos oficiales previos.

### 5. Cercana al ownership correcto

La documentación debe vivir donde corresponde según su naturaleza.

### 6. Mantenible

Debe poder actualizarse sin reescribir el proyecto documental entero.

---

## Reglas de redacción documental

1. Escribir con precisión.
2. Evitar ambigüedad.
3. Evitar frases vacías como “mejorar”, “optimizar”, “dejar listo” sin concretar.
4. Nombrar claramente módulo, contrato o proceso afectado.
5. Escribir para ejecución y revisión, no para marketing interno.
6. Evitar duplicar definiciones ya normadas en otro archivo.
7. Si un documento referencia otro, debe hacerlo de forma explícita.
8. Si un documento queda obsoleto, debe actualizarse o retirarse.

---

## Relación entre documentación y Definition of Done

Una tarea no cumple definition of done si requería documentación y no la deja actualizada.

Esto aplica especialmente cuando el cambio:

- modifica arquitectura
- modifica workflow
- modifica contratos públicos
- modifica límites de módulo
- modifica migración
- modifica reglas de permisos, tenancy o acceso
- crea un sprint
- crea o cambia una skill
- crea o cambia una checklist o prompt operativo

---

## Checklist mental antes de cerrar un cambio

Antes de cerrar un cambio, debe revisarse:

- ¿este cambio afecta una regla o contrato del proyecto?
- ¿debe quedar reflejado en `.ai/`?
- ¿debe actualizar un sprint?
- ¿debe actualizar una spec?
- ¿debe actualizar una checklist o prompt?
- ¿debe actualizar documentación de módulo o contrato?
- ¿la documentación quedó alineada con el cambio real?

Si alguna respuesta clave es sí y no se actualizó nada, el cambio no está cerrado.

---

## Riesgos documentales que deben evitarse

Se consideran señales de mala documentación:

- regla importante solo dicha en conversación
- sprint no escrito
- contrato usado pero no definido
- cambios de ownership no reflejados
- specs contradictorias
- migraciones sin rastro documental
- documentación antigua que describe un sistema que ya no existe
- comentarios en PR como única fuente de verdad de una decisión estructural

---

## Relación con Git y revisión

La documentación debe evolucionar junto con el código.

No debe dejarse “para después” cuando el cambio ya modifica:

- contratos
- límites
- arquitectura
- workflow
- sprints
- migraciones
- reglas operativas

La revisión técnica debe comprobar también si la documentación requerida fue actualizada.

---

## Estado de esta especificación

Este documento define el estándar oficial de documentación para ChefOS v3.

Todo cambio futuro que afecte operación, arquitectura, contratos, migración o planificación debe respetar estas reglas.

Después de este paso, el siguiente será cerrar las reglas de GitHub, commit y push como documento normativo separado.
