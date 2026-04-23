# ChefOS v3 Testing Standards

## Objetivo

Este documento define los estándares oficiales de testing para ChefOS v3.

Su propósito es asegurar que toda validación del proyecto sea:

- proporcional al riesgo
- útil para prevenir regresiones reales
- alineada con contratos y ownership de módulo
- explícita respecto a permisos y multi-tenant cuando aplique
- compatible con la arquitectura oficial
- compatible con documentación, Git workflow y definition of done

Este documento es normativo.

---

## Principios generales

1. El testing debe cubrir riesgo real, no solo ejecutar código.
2. No todo cambio requiere el mismo nivel de validación.
3. Los tests deben proteger comportamiento, no detalles incidentales de implementación.
4. Todo contrato relevante debe tener cobertura proporcional a su criticidad.
5. Los escenarios denegados importan tanto como el flujo feliz cuando aplica.
6. Permisos, tenancy y límites de módulo deben probarse explícitamente cuando aplican.
7. El testing debe ser mantenible y legible.
8. Un cambio no está validado solo porque “pasa localmente”.
9. Si el cambio requería documentación o trazabilidad adicional para entender su validación, debe dejarla.
10. Un cambio no está done si su testing requerido no existe.

---

## Stack oficial de testing

Herramientas confirmadas del proyecto:

- Vitest
- Playwright

### Regla crítica

No introducir frameworks, estilos o convenciones paralelas de testing sin decisión explícita del proyecto.

---

## Niveles oficiales de testing

ChefOSv2 trabaja con tres niveles principales:

### 1. Unit

Usar para validar:

- reglas puras del dominio
- validaciones
- mappers
- helpers con ownership claro
- invariantes
- transformaciones
- casos de uso acotados cuando no dependen de integración real

### 2. Integration

Usar para validar:

- contratos entre capas
- colaboración entre módulo e infraestructura
- acceso a datos encapsulado
- integración con Supabase, RPCs o Edge Functions cuando aplique
- restricciones de permisos y tenancy cuando el riesgo no puede cubrirse solo con unit
- contratos públicos del módulo

### 3. E2E

Usar para validar:

- flujos de usuario completos
- wiring real entre UI, dominio e infraestructura
- rutas críticas del producto
- permisos y aislamiento visibles desde flujo completo
- regresiones funcionales de alto impacto

---

## Regla de proporcionalidad

El nivel de testing debe decidirse por riesgo, no por costumbre.

### Riesgo bajo

Ejemplos:

- refactor interno sin cambio de contrato
- lógica pura acotada
- transformación simple
- validación aislada

Cobertura típica:

- unit

### Riesgo medio

Ejemplos:

- cambio de contrato interno del módulo
- cambio de acceso a datos encapsulado
- lógica con varias capas
- formularios con validación relevante
- colaboración entre dominio e infraestructura

Cobertura típica:

- unit
- integration

### Riesgo alto

Ejemplos:

- cambios en permisos
- cambios en multi-tenant
- cambios en RLS
- cambios en RPCs o Edge Functions
- flujos críticos del negocio
- migraciones relevantes de legacy
- cambios visibles de punta a punta

Cobertura típica:

- unit
- integration
- e2e cuando el flujo completo lo justifique

---

## Qué debe cubrirse siempre cuando aplica

Debe validarse explícitamente cuando corresponda:

- contrato público del cambio
- input válido
- input inválido
- flujo feliz
- flujo denegado
- errores de validación
- permisos
- aislamiento multi-tenant
- interacción entre capas
- regresiones de comportamiento migrado
- impacto real de una mutación o consulta

---

## Reglas por tipo de test

### Unit tests

Deben:

- ser rápidos
- ser claros
- enfocarse en una responsabilidad concreta
- evitar dependencia innecesaria de infraestructura real
- proteger reglas de dominio o comportamiento puro

No deben:

- duplicar de forma inútil lo que ya cubre integration o e2e
- cubrir detalles demasiado internos sin valor de regresión
- depender de setup opaco o complejo sin necesidad

### Integration tests

Deben:

- validar contratos reales entre piezas
- proteger el comportamiento del módulo al colaborar con infraestructura
- verificar datos, permisos o tenancy cuando la colaboración real importa
- centrarse en un punto de integración claro

No deben:

- convertirse en pseudo-e2e gigantes
- cubrir demasiadas responsabilidades a la vez
- ocultar qué frontera se está validando

### E2E tests

Deben:

- cubrir rutas críticas y representativas
- validar comportamiento observable del sistema
- centrarse en flujos que realmente merecen protección de punta a punta
- mantener un número razonable y sostenible

No deben:

- reemplazar unit o integration
- intentar cubrir cada pequeño caso del sistema
- convertirse en el único mecanismo de confianza del proyecto

---

## Regla de contratos públicos

Cuando un cambio crea, modifica o depende de un contrato público, su validación debe cubrir como mínimo:

- inputs esperados
- outputs esperados
- comportamiento ante casos inválidos
- restricciones relevantes
- consumers o integraciones afectadas cuando aplique

### Regla crítica

Si un contrato cambió y no hay tests que reflejen ese contrato, la validación está incompleta.

---

## Regla de permisos y tenancy

Cuando un cambio afecta acceso o datos sensibles, el testing debe responder explícitamente:

- quién puede leer
- quién puede crear
- quién puede editar
- quién puede ejecutar
- qué tenant puede acceder
- qué tenant no puede acceder
- qué ocurre si el contexto de acceso es inválido o insuficiente

### Debe cubrirse cuando aplique

- escenario permitido
- escenario denegado
- aislamiento entre tenants
- impacto en RLS
- impacto en RPCs
- impacto en Edge Functions

### Regla crítica

No asumir que permisos y tenancy quedan validados solo porque el flujo feliz funciona.

---

## Regla de testing por módulo

Cada módulo debe poder justify qué valida y por qué.

Debe quedar claro:

- qué reglas del dominio cubre con unit
- qué contratos o colaboraciones cubre con integration
- qué flujo crítico cubre con e2e
- qué riesgos quedan protegidos

---

## Regla de testing de legacy y migración

Si el cambio reutiliza o migra legacy, la validación debe cubrir:

- comportamiento útil rescatado
- adaptación al contrato nuevo
- regresión principal evitada
- permisos y tenancy si aplican
- descarte de supuestos viejos que ya no son válidos

### Regla crítica

Migrar sin tests suficientes no es migrar con control.

---

## Reglas de calidad de tests

Los tests deben ser:

### 1. Legibles

Debe entenderse rápido:

- qué escenario prueban
- qué riesgo cubren
- qué se espera

### 2. Enfocados

Cada test debe tener un propósito claro.

### 3. Mantenibles

No deben depender de setup innecesariamente frágil o opaco.

### 4. Relevantes

Deben proteger comportamiento importante, no ruido.

### 5. Trazables

Debe poder relacionarse el test con:

- el contrato afectado
- el módulo afectado
- el riesgo que cubre

---

## Qué no cuenta como buen testing

No cuenta como testing suficiente:

- cubrir solo el flujo feliz cuando hay restricciones relevantes
- tests que no expresan intención
- tests que replican implementación línea por línea
- tests gigantes con demasiados objetivos mezclados
- tests que pasan pero no protegen ningún riesgo real
- confiar solo en prueba manual cuando el cambio requería cobertura automatizada

---

## Regla de evidencia mínima de validación

Todo cambio que requiera testing debe poder responder:

- qué nivel de test se añadió o actualizó
- qué riesgo cubre cada test relevante
- qué escenarios permitidos se validaron
- qué escenarios denegados se validaron
- cómo se cubrieron permisos y tenancy cuando aplicaban

Si no puede responderse, la validación es insuficiente.

---

## Relación entre testing y documentación

Si el cambio afecta contratos, arquitectura, migración, permisos o workflow del proyecto, puede requerir documentación adicional para que la validación sea entendible y revisable.

### Regla crítica

No separar artificialmente testing y documentación cuando ambos son parte del cierre real del cambio.

---

## Relación entre testing y Git workflow

Los tests requeridos del cambio deben viajar con la misma unidad revisable del cambio cuando apliquen.

Eso implica:

- rama con foco claro
- commits comprensibles
- PR que explique qué se valida
- ausencia de mezcla de cambios no relacionados

### Regla crítica

No dejar tests críticos “para otro PR” si el cambio ya introduce el riesgo ahora.

---

## Preguntas obligatorias antes de dar por validado un cambio

Antes de considerar suficiente el testing de un cambio, debe poder responderse:

- ¿el nivel de testing es proporcional al riesgo?
- ¿el contrato afectado está cubierto?
- ¿los escenarios inválidos o denegados están cubiertos cuando aplican?
- ¿permisos y tenancy están cubiertos cuando aplican?
- ¿los tests son legibles y mantenibles?
- ¿la validación protege comportamiento real?
- ¿la evidencia de testing puede revisarse con claridad?

Si alguna respuesta crítica es no, el cambio no está suficientemente validado.

---

## Señales de buen testing en ChefOS v3

Se considera buena validación cuando:

- protege el riesgo real del cambio
- cubre contratos y límites importantes
- trata permisos y tenancy cuando aplica
- deja claro qué cubre cada nivel
- es legible
- es mantenible
- puede revisarse con claridad
- acompaña al cambio en la misma unidad revisable cuando corresponde

---

## Señales de mal testing en ChefOS v3

Se consideran señales de mala validación:

- solo flujo feliz
- nada de escenarios denegados cuando aplicaban
- cero cobertura de permisos o tenancy pese al riesgo
- tests opacos o gigantes
- tests que cubren ruido
- migraciones sin regresión protegida
- contrato cambiado sin tests asociados
- validación “manual” como cierre único de un cambio crítico
- tests diferidos a futuro sin justificación aceptable

---

## Relación con Definition of Done

Un cambio no está done si:

- requería unit y no existen
- requería integration y no existen
- requería e2e y no existen
- requería cubrir permisos o tenancy y no se cubrió
- cambió contrato y no lo protegió con tests
- la validación no puede revisarse con claridad

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/migration-policy.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/checklists/module-checklist.md`
- `/.ai/checklists/pr-checklist.md`
- `/.ai/checklists/migration-checklist.md`

---

## Estado de esta especificación

Este documento define los estándares oficiales de testing para ChefOS v3.

Toda validación futura del proyecto debe cumplir estas reglas de proporcionalidad, cobertura de contratos, cobertura de permisos y tenancy, mantenibilidad, documentación y trazabilidad revisable.

Cuando lo tengas, dime hecho o siguiente.
