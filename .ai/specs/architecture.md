# ChefOS v3 Architecture

## Objetivo

Este documento define la arquitectura oficial de ChefOS v3.

Su propósito es establecer una estructura modular estable, revisable y mantenible para el proyecto, evitando:

- crecimiento caótico
- mezcla de concerns
- lógica de negocio dispersa
- cruces arbitrarios entre módulos
- uso indebido de capas compartidas
- expansión lateral sin control
- cambios estructurales sin rastro documental
- cambios arquitectónicos sin trazabilidad clara en Git y PR

Este documento es normativo.

---

## Principios arquitectónicos

1. La arquitectura debe expresar ownership claro.
2. La arquitectura debe separar dominio, composición, infraestructura y UI.
3. Cada módulo debe tener frontera pública clara.
4. Ningún módulo debe depender de internals de otro módulo.
5. La arquitectura debe permitir crecimiento por sprints pequeños.
6. La estructura del repo debe reflejar responsabilidades reales.
7. Multi-tenant, permisos y límites de módulo deben poder tratarse explícitamente.
8. La arquitectura no se cambia por conveniencia local.
9. Todo cambio estructural relevante debe dejar rastro documental cuando aplique.
10. Todo cambio arquitectónico debe poder entrar con trazabilidad clara en rama, commits y PR.

---

## Estructura oficial del repositorio

La estructura objetivo oficial de ChefOS v3 es:

```txt
src/
  app/
  features/
  lib/
  components/

supabase/
tests/
.ai/
```

### Significado de cada área

- `src/app/` → routing, layout y composición
- `src/features/` → módulos de negocio
- `src/lib/` → concerns compartidos y plataforma
- `src/components/` → UI reutilizable
- `supabase/` → migraciones, funciones, políticas, seeds y lógica de base de datos
- `tests/` → unit, integration y e2e
- `.ai/` → sistema operativo interno del proyecto

### Regla crítica de arquitectura

La arquitectura oficial no se negocia tarea a tarea.

Si una necesidad concreta parece no encajar:

- primero se valida si la tarea está mal planteada
- después se valida si el módulo owner es incorrecto
- después se valida si el contrato entre módulos está mal definido
- solo al final se considera si hace falta una decisión arquitectónica explícita

Nunca se inventa una estructura nueva por conveniencia local.

---

## `src/app/`

### Responsabilidad

`src/app/` existe para:

- rutas
- layouts
- composición de pantallas
- wiring mínimo entre la capa de navegación y los módulos

### No debe contener

- lógica de negocio
- reglas de dominio
- acceso improvisado a datos del dominio
- validaciones funcionales profundas
- decisiones de ownership entre módulos

### Regla

Las páginas componen. No gobiernan el negocio.

---

## `src/features/`

### Responsabilidad

`src/features/` es la capa principal de negocio del proyecto.

Aquí viven los módulos oficiales de ChefOS v3.

Cada módulo debe tener:

- ownership claro
- frontera pública clara
- contratos explícitos
- estructura proporcional a su complejidad
- lógica de dominio encapsulada

### Módulos oficiales

- `identity`
- `commercial`
- `recipes`
- `catalog`
- `procurement`
- `inventory`
- `production`
- `reporting`
- `compliance`
- `automation`
- `notifications`
- `integrations`
- `hr`
- `agents`

### Regla

Toda lógica de negocio debe pertenecer claramente a uno de estos módulos o a una decisión explícita ya aprobada.

---

## `src/lib/`

### Responsabilidad

`src/lib/` existe para concerns compartidos reales y piezas de plataforma.

Ejemplos válidos:

- wrappers técnicos compartidos
- utilidades de plataforma
- piezas transversales no dueñas de dominio
- helpers realmente comunes y justificados

### No debe contener

- lógica de negocio de un módulo escondida aquí
- contratos de dominio movidos por comodidad
- soluciones temporales que se convierten en permanentes
- mezclas ambiguas entre módulos

### Regla crítica

`src/lib/` no es cajón de sastre.

Si una pieza pertenece claramente a un módulo, debe vivir en ese módulo.

---

## `src/components/`

### Responsabilidad

`src/components/` existe para UI reutilizable y presentacional.

Ejemplos válidos:

- componentes visuales compartidos
- piezas reutilizables de interfaz
- elementos presentacionales agnósticos del dominio

### No debe contener

- lógica de negocio
- acceso a datos del dominio
- decisiones funcionales específicas de módulo
- reglas de permisos del negocio
- transformaciones de dominio por conveniencia

### Regla

La UI compartida no debe convertirse en lugar de negocio oculto.

---

## `supabase/`

### Responsabilidad

`supabase/` concentra la lógica de persistencia y acceso a datos del sistema cuando corresponde.

Puede contener:

- migraciones
- políticas RLS
- RPCs
- Edge Functions
- seeds
- lógica de base de datos

### Regla

Todo cambio aquí debe tratar explícitamente, cuando aplique:

- datos
- permisos
- multi-tenant
- impacto en contratos consumidores
- impacto documental
- trazabilidad clara del cambio

---

## `tests/`

### Responsabilidad

`tests/` contiene validación automatizada del sistema.

Puede incluir:

- unit
- integration
- e2e

### Regla

La arquitectura debe permitir mapear cada cambio a una estrategia de validación proporcional al riesgo.

Si un cambio arquitectónico o modular no puede probarse con claridad, la solución está incompleta o mal ubicada.

---

## `.ai/`

### Responsabilidad

`.ai/` es el sistema operativo interno del proyecto.

Aquí viven:

- specs
- sprints
- prompts
- checklists
- skills
- workflow
- reglas de documentación
- reglas de Git y GitHub
- definition of done

### Regla

Toda decisión estructural relevante del proyecto debe poder reflejarse en `.ai/` cuando aplique.

La arquitectura del repo y la base documental deben permanecer alineadas.

---

## Regla de ownership modular

Todo concern funcional debe tener un módulo owner claro.

Debe poder responderse siempre:

- qué módulo posee esta lógica
- qué módulo no debe tocarla
- qué contratos públicos existen
- qué consumers autorizados la usan
- qué parte es internal y qué parte es pública

### No válido

- ownership difuso
- varios módulos resolviendo lo mismo
- acceso cruzado a internals
- mover lógica entre módulos por conveniencia local

---

## Regla de frontera pública

Cada módulo debe exponer una frontera pública clara.

Esto implica:

- contratos públicos explícitos
- consumers definidos
- internals encapsulados
- ausencia de dependencias accidentales desde fuera

### Regla crítica

Si otro módulo necesita usar algo, debe consumir contrato público, no navegar internals.

---

## Regla de colaboración entre módulos

Los módulos pueden colaborar, pero solo bajo estas condiciones:

- el ownership principal sigue claro
- la colaboración ocurre por contrato público
- no se introduce dependencia circular
- el alcance del cambio sigue cerrado
- permisos y tenancy se tratan cuando aplican

### No válido

- “ya que estamos, tocamos también…”
- importar internals de otro módulo
- resolver datos de otro dominio por atajo técnico
- duplicar lógica fuente por comodidad

---

## Regla de estructura interna del módulo

La estructura interna de cada módulo debe ser proporcional a su complejidad real.

Ejemplo base posible:

```txt
src/features/<module>/
  index.ts
  domain/
  application/
  infrastructure/
  ui/
```

### Regla importante

Esto es guía, no obligación rígida.

- No todos los módulos necesitan todas las carpetas.
- No se debe crear complejidad artificial.

La estructura final debe mantener:

- ownership claro
- contratos claros
- separación suficiente
- mantenibilidad

---

## Regla de acceso a datos

El acceso a datos debe quedar encapsulado con criterio.

No debe dispersarse por:

- páginas
- layouts
- componentes compartidos
- múltiples puntos sin ownership

Cuando un módulo toca datos, debe quedar claro:

- dónde accede
- cómo encapsula ese acceso
- qué parte vive en el módulo
- qué parte vive en `supabase/`
- qué impacto tiene en permisos y tenancy

---

## Regla de permisos y multi-tenant

La arquitectura oficial debe permitir tratar de forma explícita:

- quién puede leer
- quién puede crear
- quién puede editar
- quién puede ejecutar
- qué tenant aplica
- qué límites de acceso existen

### Regla crítica

No se considera buena arquitectura una solución que obliga a dejar permisos o tenancy implícitos.

---

## Regla de legacy dentro de la arquitectura

El código legacy no tiene derecho automático a encajar en la arquitectura nueva.

Toda reutilización debe pasar por:

- clasificación
- ownership correcto
- capa destino correcta
- contrato objetivo
- validación suficiente
- documentación cuando aplique
- trazabilidad clara en Git y PR

La arquitectura nueva manda. El legacy se adapta o se descarta.

---

## Regla de cambios arquitectónicos

Se considera cambio arquitectónico relevante cuando se modifica, por ejemplo:

- responsabilidad de una capa
- ownership entre módulos
- frontera pública de un módulo
- estructura oficial del repo
- reglas de colaboración entre módulos
- ubicación esperada de ciertos concerns

### Cuando eso ocurra

Debe evaluarse explícitamente:

- impacto en specs
- impacto en workflow
- impacto en module-template
- impacto en checklists
- impacto en prompts o skills
- impacto en sprints cuando corresponda
- trazabilidad clara en rama, commits y PR

### Regla crítica

No dejar cambios arquitectónicos relevantes solo implícitos en código o en conversación.

---

## Regla de documentación asociada a arquitectura

Debe actualizarse documentación cuando aplique si el cambio:

- altera ownership
- altera frontera pública
- altera ubicación oficial de concerns
- altera límites entre módulos
- altera flujo de trabajo estructural
- altera la forma oficial de construir módulos

No está cerrada una decisión arquitectónica si requería documentación y no la deja.

---

## Regla de trazabilidad en Git y PR

Un cambio con impacto arquitectónico o modular debe poder entrar al historial del proyecto con claridad.

Debe ser posible identificar:

- rama con foco claro
- commits legibles
- PR revisable
- módulo principal afectado
- frontera o contrato afectado
- documentación actualizada cuando aplica

No debe mezclarse una decisión arquitectónica con trabajo lateral no relacionado.

---

## Señales de buena arquitectura en ChefOS v3

Se consideran señales de buena arquitectura:

- ownership claro
- capas claras
- contratos claros
- internals encapsulados
- colaboración por contratos
- acceso a datos encapsulado
- permisos y tenancy tratables
- documentación alineada
- cambios estructurales trazables y revisables

---

## Señales de mala arquitectura en ChefOS v3

Se consideran señales de mala arquitectura:

- lógica de negocio en `src/app/`
- lógica de negocio en `src/components/`
- `src/lib/` usado como vertedero de dominio
- internals consumidos desde fuera
- varios módulos resolviendo lo mismo
- ownership ambiguo
- dependencias circulares
- permisos y tenancy implícitos
- cambios estructurales sin documentación
- cambios arquitectónicos mezclados en PRs caóticos

---

## Relación con Definition of Done

Un cambio no cumple la arquitectura oficial si:

- está en la capa incorrecta
- rompe ownership
- rompe frontera pública
- introduce acoplamiento lateral indebido
- ignora permisos o tenancy cuando aplica
- requería actualización documental y no la deja
- no puede revisarse ni trazarse con claridad

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/README.md`
- `/.ai/WORKFLOW.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/migration-policy.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/specs/module-template.md`

---

## Estado de esta especificación

Este documento define la arquitectura oficial de ChefOS v3.

Toda implementación futura del proyecto debe respetar estas reglas de capas, ownership, contratos, permisos, documentación y trazabilidad estructural.
