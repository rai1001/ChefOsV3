# ChefOS v3 Module Template

## Objetivo

Este documento define la plantilla oficial para diseñar, construir, revisar o migrar cualquier módulo de ChefOS v3.

Su propósito es asegurar que todos los módulos del proyecto se construyan con una estructura coherente, ownership claro, contratos explícitos, validación suficiente, documentación alineada y trazabilidad revisable.

Este documento es normativo.

---

## Principios del template

1. Cada módulo debe tener ownership claro.
2. Cada módulo debe tener frontera pública clara.
3. Ningún módulo debe absorber concerns de otro por comodidad.
4. Todo módulo debe poder consumirse por contrato, no por acceso a internals.
5. Todo módulo debe tratar permisos, tenancy y límites cuando apliquen.
6. Todo módulo debe tener validación proporcional al riesgo.
7. Todo módulo debe dejar documentación actualizada cuando aplique.
8. Todo módulo debe poder entrar en Git y PR con trazabilidad clara.
9. Ningún módulo debe introducir arquitectura paralela.
10. Ningún módulo debe cerrarse sin cumplir definition of done.

---

## Ubicación oficial del módulo

La ubicación normal de un módulo de negocio es:

```txt
src/features/<module>/
```

Ejemplos:

- `src/features/identity/`
- `src/features/commercial/`
- `src/features/recipes/`

### Regla crítica

La lógica de negocio del módulo no debe vivir en:

- `src/app/`
- `src/components/`

`src/lib/` solo puede participar cuando exista un concern realmente compartido y no dominio específico del módulo.

## Qué debe definir siempre un módulo

Todo módulo debe dejar claro, como mínimo:

- propósito del módulo
- ownership
- fuera de alcance
- frontera pública
- dependencias autorizadas
- datos que toca cuando aplique
- permisos y tenancy cuando apliquen
- estrategia de testing
- impacto documental cuando aplique
- trazabilidad esperable en Git y PR

## Plantilla oficial de definición de módulo

Todo módulo nuevo o revisado debe poder describirse con esta estructura.

### 1. Nombre del módulo

`[module-name]`

Ejemplo:

`identity`

### 2. Propósito del módulo

Debe responder:

- qué problema del sistema resuelve este módulo
- qué parte del dominio modela
- por qué existe como módulo separado

Formato esperado:

```txt
## Propósito

El módulo `[module-name]` es responsable de [describir responsabilidad principal].

Existe para [describir función operativa principal].

No existe para [indicar responsabilidades que no debe absorber].
```

### 3. Ownership

Debe responder:

- qué pertenece al módulo
- qué no pertenece al módulo
- qué pieza del sistema es owner de cada concern relevante

Formato esperado:

```txt
## Ownership

Este módulo es owner de:

- [concern 1]
- [concern 2]
- [concern 3]

Este módulo no es owner de:

- [concern ajeno 1]
- [concern ajeno 2]
- [concern ajeno 3]
```

### 4. Fuera de alcance

Todo módulo debe declarar explícitamente qué no debe resolverse dentro de él.

Formato esperado:

```txt
## Fuera de alcance

Este módulo no debe resolver:

- [alcance excluido 1]
- [alcance excluido 2]
- [alcance excluido 3]
```

### 5. Frontera pública del módulo

Todo módulo debe dejar clara su frontera pública.

Debe responder:

- qué expone
- qué puede consumirse desde fuera
- qué no debe usarse desde fuera

Formato esperado:

```txt
## Frontera pública

El módulo expone públicamente:

- [contrato público 1]
- [contrato público 2]

No debe exponerse:

- [internal 1]
- [internal 2]
```

### 6. Contratos públicos

Todo módulo debe definir sus contratos principales cuando aplique.

Debe quedar claro:

- input
- output
- restricciones
- consumers esperados
- dependencias autorizadas

Formato esperado:

```txt
## Contratos públicos

### [contract-name]

Input:
- [input]

Output:
- [output]

Restricciones:
- [permiso o tenancy]
- [límite funcional]

Consumers autorizados:
- [módulos o capas consumidoras]
```

### 7. Dependencias autorizadas

Debe quedar claro qué puede depender del módulo y de qué puede depender el módulo.

Formato esperado:

```txt
## Dependencias autorizadas

Este módulo puede depender de:

- [dependencia autorizada 1]
- [dependencia autorizada 2]

Este módulo no debe depender de:

- [dependencia prohibida 1]
- [dependencia prohibida 2]
```

### 8. Estructura mínima recomendada

La estructura debe ser proporcional al tamaño real del módulo.

Ejemplo base:

```txt
src/features/<module>/
  index.ts
  domain/
  application/
  infrastructure/
  ui/
```

### Regla importante

No todos los módulos necesitan exactamente las mismas carpetas.

La estructura final debe ser la mínima necesaria para mantener:

- ownership claro
- contrato claro
- responsabilidades separadas
- mantenibilidad

No se debe crear complejidad artificial.

## Guía de responsabilidad por capas

### `domain/`

Usar para:

- reglas del negocio del módulo
- entidades del dominio
- invariantes
- validaciones del dominio
- contratos conceptuales del módulo

### `application/`

Usar para:

- casos de uso
- orquestación interna del módulo
- coordinación entre dominio e infraestructura
- acciones específicas del módulo

### `infrastructure/`

Usar para:

- acceso a datos
- integración con Supabase
- RPCs
- Edge Functions
- adapters técnicos del módulo

### `ui/`

Usar para:

- componentes específicos del módulo
- formularios del módulo
- pantallas o piezas UI propias del módulo

### `index.ts`

Usar para:

- exponer la frontera pública del módulo
- evitar acceso directo a internals desde otros módulos

## Regla de acceso a datos

Si el módulo toca datos, debe quedar claro:

- dónde accede a datos
- cómo se encapsula ese acceso
- qué parte vive en `supabase/`
- qué parte vive dentro del módulo

No deben dispersarse queries o mutaciones por:

- páginas
- layouts
- componentes compartidos
- múltiples puntos sin ownership

## Regla de permisos y tenancy

Si el módulo toca acceso o datos sensibles, debe declararse explícitamente:

- quién puede leer
- quién puede crear
- quién puede editar
- quién puede ejecutar
- qué tenant aplica
- qué reglas de aislamiento existen
- si afecta RLS, RPCs o Edge Functions

Formato esperado:

```txt
## Permisos y tenancy

Lectura:
- [regla]

Escritura:
- [regla]

Ejecución:
- [regla]

Tenancy:
- [regla de aislamiento]

Impacto en RLS/RPCs/Edge Functions:
- [si/no + detalle]
```

## Regla de testing del módulo

Todo módulo debe definir su validación mínima.

Debe responder:

- qué se cubre con unit tests
- qué se cubre con integration tests
- qué se cubre con e2e tests
- qué escenarios denegados deben probarse
- qué riesgos cubren los tests

Formato esperado:

```txt
## Testing requerido

Unit:
- [qué cubre]

Integration:
- [qué cubre]

E2E:
- [qué cubre]

Permisos y tenancy:
- [qué validación existe]

Riesgos cubiertos:
- [riesgo 1]
- [riesgo 2]
```

## Regla de documentación del módulo

Si un módulo cambia en cualquiera de estos puntos, debe dejar rastro documental cuando aplique:

- ownership
- contratos públicos
- límites
- responsabilidades
- sprint asociado
- migración relevante
- reglas de permisos o tenancy

Formato esperado:

```txt
## Documentación requerida

Debe actualizarse:
- [spec, sprint, checklist, prompt o skill si aplica]

Contrato afectado:
- [sí/no + detalle]

Cambio de ownership o límites:
- [sí/no + detalle]

Rastro documental mínimo:
- [evidencia esperada]
```

## Regla de trazabilidad en Git y PR

Todo trabajo de módulo debe poder entrar con foco claro al historial del proyecto.

Debe ser posible identificar:

- rama con foco claro
- commits legibles
- PR revisable
- alcance cerrado
- módulo principal afectado
- contrato afectado
- documentación incluida cuando aplica

Formato esperado:

```txt
## Trazabilidad en Git

Rama recomendada:
- [nombre sugerido]

Commits esperados:
- [tipo y acción]

PR debe explicar:
- [objetivo]
- [alcance]
- [contrato afectado]
- [tests]
- [documentación]
```

## Plantilla resumida para construir o revisar un módulo

```txt
# [Module Name]

## Propósito
[descripción]

## Ownership
[owner de]
[no owner de]

## Fuera de alcance
[lista]

## Frontera pública
[qué expone]
[qué no expone]

## Contratos públicos
[input / output / restricciones / consumers]

## Dependencias autorizadas
[lista]

## Estructura del módulo
[carpetas y responsabilidad]

## Datos, permisos y tenancy
[reglas]

## Testing requerido
[unit / integration / e2e / riesgos]

## Documentación requerida
[qué debe actualizarse]

## Trazabilidad en Git
[rama / commits / PR]

## Criterio de done
[qué debe cumplirse]
```

## Señales de buen módulo

Se considera una buena implementación modular cuando:

- el ownership es claro
- la frontera pública es clara
- no hay acceso accidental a internals
- la lógica está en la capa correcta
- permisos y tenancy están tratados cuando aplican
- los tests cubren riesgo real
- la documentación necesaria existe
- la trazabilidad del cambio es clara

## Señales de mal módulo

Se consideran señales de mala implementación modular:

- ownership ambiguo
- lógica de negocio en páginas o UI compartida
- contrato implícito
- consumers dependiendo de internals
- `src/lib/` usado para esconder dominio
- permisos asumidos y no declarados
- tenancy ignorado
- falta de tests relevantes
- falta de documentación requerida
- rama o PR mezclando varias cosas

## Relación con Definition of Done

Un módulo o cambio de módulo no está done si:

- no tiene ownership claro
- no tiene frontera pública clara
- no tiene contrato claro cuando aplica
- no trata permisos o tenancy cuando corresponde
- no tiene validación suficiente
- no actualiza documentación cuando corresponde
- no puede entrar con trazabilidad clara en Git y PR

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/checklists/module-checklist.md`

## Estado de esta especificación

Este documento define la plantilla oficial de módulo para ChefOS v3.

Todo módulo nuevo, revisado o migrado debe poder describirse y validarse contra este template.
