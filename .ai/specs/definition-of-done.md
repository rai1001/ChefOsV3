# ChefOS v3 Definition of Done

## Objetivo

Este documento define qué condiciones mínimas debe cumplir un cambio para considerarse realmente terminado en ChefOS v3.

Su propósito es impedir cierres falsos basados en ideas como:

- “ya funciona”
- “ya lo subí”
- “ya hay código”
- “ya hice push”
- “ya abrí PR”
- “ya lo revisamos por encima”

En ChefOS v3, `done` significa que un cambio quedó correcto, verificable, revisable, documentado y trazable dentro de la arquitectura oficial del proyecto.

Este documento es normativo.

---

## Principio central

Un cambio no está done solo porque exista.

Un cambio está done únicamente cuando:

- su alcance está cerrado
- su encaje arquitectónico es correcto
- su contrato es claro
- su validación es suficiente
- su impacto en datos, permisos y tenancy está tratado cuando aplica
- su documentación está actualizada cuando aplica
- su trazabilidad en Git y PR es correcta cuando aplica
- su revisión puede aprobarlo con evidencia real

---

## Regla de cierre real

Para considerar un cambio como `done`, debe poder responderse con claridad:

- qué problema resolvió
- qué módulo tocó
- qué contrato tocó
- qué archivos cambió
- qué tests lo validan
- qué documentación actualizó
- cómo entra al historial del proyecto
- por qué no dejó deuda crítica oculta

Si alguna de estas respuestas clave no existe cuando aplica, el cambio no está done.

---

## Condiciones mínimas de done

### 1. Alcance cerrado

El cambio debe tener un objetivo concreto y acotado.

Debe estar claro:

- qué entra
- qué queda fuera
- qué módulo domina el cambio
- qué no se tocó

No está done si:

- mezcla varias tareas
- abrió trabajo lateral no aprobado
- cambió más cosas de las declaradas
- deja un cierre ambiguo

---

### 2. Encaje arquitectónico correcto

El cambio debe respetar la arquitectura oficial del repositorio.

Debe cumplirse:

- `src/app/` solo para routing, layout y composición
- `src/features/` para módulos de negocio
- `src/lib/` para concerns compartidos y plataforma
- `src/components/` para UI reutilizable
- `supabase/` para datos, políticas, migraciones y funciones
- `tests/` para validación
- `.ai/` para control operativo del proyecto

No está done si:

- la lógica de negocio queda en páginas
- la lógica de negocio queda en componentes compartidos
- `src/lib/` se usa como cajón de sastre del dominio
- se rompe la frontera entre módulos
- se introduce arquitectura paralela

---

### 3. Ownership y límites del módulo

El cambio debe respetar ownership real del módulo afectado.

Debe quedar claro:

- qué módulo es owner
- qué contratos públicos usa o crea
- qué dependencias están autorizadas
- qué límites modulares se mantienen

No está done si:

- un módulo absorbió lógica ajena por comodidad
- se tocaron internals de otro módulo sin contrato público
- se introdujeron acoplamientos laterales innecesarios
- se generó dependencia circular

---

### 4. Contrato claro

Todo cambio relevante debe tener contrato claro cuando aplica.

Debe quedar claro:

- qué entrada recibe
- qué salida produce
- qué contrato usa, modifica o crea
- qué consumers dependen de él
- qué restricciones funcionales existen

No está done si:

- el contrato es implícito
- inputs y outputs no están claros
- se expone un internal accidentalmente
- el impacto del cambio contractual no está identificado

---

### 5. Calidad de implementación

El cambio debe dejar código mantenible y coherente con el proyecto.

Debe cumplirse:

- nombres claros
- tipado suficientemente explícito
- responsabilidades razonablemente separadas
- ausencia de deuda técnica crítica introducida
- solución proporcional al problema

No está done si:

- la implementación degrada mantenibilidad
- hay abstracciones innecesarias
- hay código temporal escondido
- hay deuda crítica sin declarar
- el cambio quedó confuso o difícil de revisar

---

### 6. Datos, permisos y tenancy

Cuando aplique, el cambio debe tratar explícitamente:

- impacto en datos
- impacto en permisos
- impacto multi-tenant
- impacto en RLS
- impacto en RPCs
- impacto en Edge Functions
- límites funcionales de acceso

No está done si:

- se asumieron permisos sin validación
- no se evaluó aislamiento multi-tenant
- se cambió acceso a datos sin revisar impacto
- hay riesgo funcional o de seguridad no cubierto

---

### 7. Legacy y migración

Si el cambio reutiliza código previo, debe respetar la política de migración.

Debe quedar claro:

- qué pieza legacy se tocó
- qué clasificación recibió
- cuál es su destino
- qué se rescata
- qué se descarta
- qué validación protege la migración

No está done si:

- hubo copy-paste sin adaptación
- se movió estructura vieja como falsa migración
- no hay clasificación
- no hay contrato objetivo
- la migración no puede revisarse con claridad

---

### 8. Testing suficiente

Todo cambio debe tener validación proporcional al riesgo.

Según aplique, debe incluir:

- unit tests
- integration tests
- e2e tests
- validación de permisos
- validación de tenancy
- validación de migración
- validación de escenarios denegados

No está done si:

- faltan tests necesarios
- solo se probó el flujo feliz cuando no bastaba
- permisos o tenancy quedaron sin cubrir
- la validación no reduce riesgo real de regresión

---

### 9. Documentación actualizada

Si el cambio afecta operación, arquitectura, contrato, migración, sprint, workflow o reglas del proyecto, debe dejar rastro documental.

Debe actualizarse lo que corresponda:

- specs
- sprints
- prompts
- checklists
- skills
- documentación de contrato
- documentación de módulo
- documentación de migración

No está done si:

- requería documentación y no se actualizó
- una decisión estructural quedó solo en conversación o PR
- cambió un contrato y no quedó documentado
- cambió ownership o límites y no quedó reflejado

---

### 10. Git workflow y trazabilidad correctos

El cambio debe poder entrar al historial del proyecto con trazabilidad clara.

Debe cumplirse cuando aplique:

- rama con foco claro
- commits legibles y coherentes
- PR con contexto suficiente
- no mezclar varias iniciativas en la misma unidad revisable

No está done si:

- la rama es ambigua
- los commits son opacos o genéricos
- el PR mezcla objetivos heterogéneos
- el historial dificulta entender el cambio
- se usa push como sustituto de cierre estructurado

---

### 11. Revisión estructurada posible

El cambio debe poder revisarse con evidencia real.

Debe poder comprobarse:

- alcance real vs declarado
- encaje arquitectónico
- contratos
- datos, permisos y tenancy
- tests
- documentación
- trazabilidad en Git
- compatibilidad con definition of done

No está done si:

- no puede revisarse con claridad
- falta evidencia suficiente
- depende de contexto oral o implícito
- el review no podría emitir dictamen confiable

---

## Regla de evidencia mínima

Todo cambio done debe dejar evidencia verificable.

Ejemplos de evidencia válida:

- archivo creado o modificado con responsabilidad clara
- contrato definido
- tests añadidos o actualizados
- documentación actualizada
- clasificación de migración registrada
- sprint actualizado
- PR revisable con alcance claro

Ejemplos de evidencia no válida:

- “lo hablamos”
- “ya lo vi”
- “está más o menos”
- “lo cierro y luego lo ordenamos”
- “falta pulir pero ya está”

---

## Qué no cuenta como done

No cuenta como done:

- tener código sin tests cuando eran necesarios
- tener tests sin contrato claro
- tener código correcto en la capa equivocada
- tener PR abierto sin revisión suficiente
- tener push hecho sin trazabilidad clara
- tener funcionalidad sin documentación requerida
- tener migración sin clasificación
- tener implementación que funciona pero rompe límites modulares
- dejar deuda crítica escondida como temporal

---

## Relación entre done y sprint

Una tarea no puede contarse como cerrada dentro de un sprint si no cumple esta definición.

Un sprint no puede considerarse realmente cerrado si sus entregables clave no cumplen definition of done.

---

## Relación entre done y PR

Un PR mergeado no convierte automáticamente el trabajo en done.

El PR solo puede representar trabajo done si:

- el alcance era correcto
- la revisión fue suficiente
- los tests eran suficientes
- la documentación requerida fue actualizada
- la trazabilidad del cambio es clara
- no quedaron bloqueos críticos abiertos

---

## Preguntas obligatorias antes de marcar done

Antes de dar por terminado un cambio, debe poder responderse:

- ¿el alcance está realmente cerrado?
- ¿está en la capa correcta?
- ¿respeta límites de módulo?
- ¿el contrato está claro?
- ¿los tests requeridos existen?
- ¿permisos y tenancy están tratados cuando aplican?
- ¿la documentación requerida está actualizada?
- ¿la trazabilidad en Git y PR es correcta?
- ¿la revisión puede aprobarlo con evidencia suficiente?

Si alguna respuesta crítica es no, no está done.

---

## Regla de criterio conservador

Ante duda, el cambio no debe marcarse como done.

En ChefOS v3 se prefiere:

- cierre más estricto
- alcance más claro
- evidencia más concreta
- revisión más verificable

antes que un cierre optimista o ambiguo.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/migration-policy.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/checklists/module-checklist.md`
- `/.ai/checklists/pr-checklist.md`
- `/.ai/checklists/migration-checklist.md`

---

## Estado de esta especificación

Este documento define la definición oficial de `done` para ChefOS v3.

Nada debe darse por terminado en el proyecto si no cumple estas condiciones de alcance, arquitectura, contrato, validación, documentación, Git workflow y revisión estructurada.
