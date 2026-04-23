# ChefOS v3 PR Checklist

## Objetivo

Esta checklist sirve para revisar cualquier Pull Request de ChefOS v3 con un criterio estructurado, consistente y alineado con la arquitectura oficial del proyecto.

Debe usarse antes de aprobar o cerrar cualquier PR.

No sustituye las specs. Las aterriza en una revisión operativa concreta.

---

## Instrucciones de uso

Esta checklist debe responderse con criterio estricto.

Estados sugeridos por ítem:

- `OK`
- `NO`
- `N/A`

Si un punto crítico aplicaba y queda en `NO`, el PR no debe aprobarse.

---

## 1. Alcance del PR

- [ ] El objetivo del PR está claro.
- [ ] El alcance del PR está cerrado.
- [ ] El PR no mezcla varias tareas distintas sin justificación explícita.
- [ ] El PR corresponde a una tarea o sprint concreto.
- [ ] Está claro qué quedó fuera del alcance.
- [ ] No hay expansión lateral injustificada.

---

## 2. Encaje con arquitectura

- [ ] El PR respeta la arquitectura oficial de ChefOS v3.
- [ ] `src/app/` solo contiene routing, layout o composición cuando aplica.
- [ ] La lógica de negocio está en `src/features/` cuando aplica.
- [ ] `src/lib/` no se usó como cajón de sastre para lógica de dominio.
- [ ] `src/components/` no contiene lógica de negocio.
- [ ] `supabase/` concentra correctamente cambios de datos, funciones o políticas cuando aplica.
- [ ] La ubicación de los archivos es coherente con su responsabilidad.

---

## 3. Módulos y límites

- [ ] El módulo principal afectado está identificado.
- [ ] El cambio respeta los límites del módulo afectado.
- [ ] No se tocaron módulos no relacionados sin justificación clara.
- [ ] No se cruzaron límites modulares sin contrato público.
- [ ] No se introdujeron dependencias laterales innecesarias.
- [ ] No se introdujeron dependencias circulares.

---

## 4. Contratos públicos

- [ ] Está claro qué contrato usa, modifica o crea este PR.
- [ ] Los inputs relevantes están definidos con claridad.
- [ ] Los outputs relevantes están definidos con claridad.
- [ ] Los contratos públicos importantes están tipados de forma explícita.
- [ ] No se exponen internals de un módulo de forma accidental.
- [ ] Si hubo cambio de contrato, su impacto está identificado.

---

## 5. Calidad de implementación

- [ ] El código es legible.
- [ ] Los nombres son claros y orientados al dominio.
- [ ] No hay lógica de negocio ubicada en una capa incorrecta.
- [ ] No se abusó de `any`.
- [ ] Los tipos importantes están definidos con claridad.
- [ ] Las funciones son razonablemente pequeñas y enfocadas.
- [ ] No se introdujeron utilidades genéricas sin ownership claro.
- [ ] La solución no degrada la mantenibilidad del repo.

---

## 6. Datos, permisos y tenancy

Completar cuando el PR afecte datos, identity, acceso o acciones sensibles.

- [ ] Se evaluó el impacto en datos.
- [ ] Se evaluó el impacto en permisos.
- [ ] Se evaluó el impacto multi-tenant.
- [ ] Se evaluó el impacto en RLS cuando aplica.
- [ ] Se evaluó el impacto en RPCs cuando aplica.
- [ ] Se evaluó el impacto en Edge Functions cuando aplica.
- [ ] Está claro quién puede leer, crear, editar o ejecutar la funcionalidad afectada.
- [ ] No se asumió acceso sin validación explícita.

---

## 7. Legacy y migración

Completar solo si el PR reutiliza o migra código previo.

- [ ] La pieza legacy fue identificada explícitamente.
- [ ] La pieza fue clasificada antes de reutilizarse.
- [ ] El destino dentro de la arquitectura oficial quedó claro.
- [ ] No se copió y pegó código viejo sin adaptación.
- [ ] No se arrastró estructura antigua por comodidad.
- [ ] El comportamiento migrado quedó integrado en el sistema nuevo y no solo movido.
- [ ] La migración tiene validación suficiente según riesgo.

---

## 8. Testing

- [ ] El nivel de testing es proporcional al riesgo del cambio.
- [ ] Hay unit tests cuando aplican.
- [ ] Hay integration tests cuando aplican.
- [ ] Hay e2e tests cuando aplican.
- [ ] Se validan escenarios denegados además del flujo feliz cuando corresponde.
- [ ] Se validan permisos y tenancy cuando corresponde.
- [ ] Los tests son legibles y mantenibles.
- [ ] Los tests protegen comportamiento real y no solo implementación incidental.

---

## 9. Documentación

- [ ] Se evaluó si el PR requería actualización documental.
- [ ] La documentación requerida fue actualizada cuando aplica.
- [ ] Specs, sprints, prompts, checklists o skills fueron actualizados cuando correspondía.
- [ ] Los cambios de contrato público dejaron rastro documental claro.
- [ ] Los cambios de arquitectura, workflow o migración dejaron rastro documental claro.
- [ ] No queda una decisión estructural importante solo implícita en la conversación o en el PR.

---

## 10. Git workflow y trazabilidad

- [ ] La rama del PR tiene un foco claro.
- [ ] El nombre de la rama es coherente con el objetivo del cambio.
- [ ] Los commits son legibles y coherentes con el alcance.
- [ ] No hay commits genéricos u opacos como `update`, `misc`, `wip` o equivalentes.
- [ ] El PR es revisable como una sola unidad de cambio.
- [ ] El historial ayuda a entender el cambio y no añade ruido innecesario.

---

## 11. Revisión funcional y técnica

- [ ] El PR resuelve el problema declarado.
- [ ] La implementación coincide con el alcance prometido.
- [ ] No introduce refactors laterales innecesarios.
- [ ] No deja comportamientos ambiguos.
- [ ] No deja deuda crítica oculta.
- [ ] La solución puede mantenerse dentro del stack confirmado.
- [ ] La solución puede evolucionar sin romper la arquitectura oficial.

---

## 12. Definition of Done

- [ ] La salida del PR es concreta y verificable.
- [ ] El trabajo está en la capa correcta.
- [ ] Los contratos relevantes están claros.
- [ ] Los tests requeridos existen.
- [ ] La documentación requerida existe cuando aplicaba.
- [ ] Permisos y tenancy fueron contemplados cuando aplicaban.
- [ ] No queda trabajo crítico escondido como “temporal”.
- [ ] El PR cumple definition of done.

---

## 13. Evidencia mínima de cierre

- [ ] Los archivos modificados corresponden al objetivo declarado.
- [ ] La revisión puede identificar claramente qué cambió y por qué.
- [ ] La validación del cambio es comprobable.
- [ ] La salida del PR puede describirse de forma concreta y no ambigua.

---

## Resultado final

### Estado del PR

- [ ] `APPROVABLE`
- [ ] `NOT APPROVABLE`

### Motivos de bloqueo si no es aprobable

-
-
-

### Observaciones finales de revisión

-
-
-
