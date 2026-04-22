# ChefOS v3 Migration Checklist

## Objetivo

Esta checklist sirve para validar cualquier migración de código legacy hacia la arquitectura oficial de ChefOS v3.

Debe usarse antes de dar por cerrada cualquier tarea que reutilice, adapte, extraiga o reimplemente comportamiento proveniente de código previo.

No sustituye la política de migración. La aterriza en una revisión operativa concreta.

---

## Instrucciones de uso

Esta checklist debe responderse con criterio estricto.

Estados sugeridos por ítem:

- `OK`
- `NO`
- `N/A`

Si un punto crítico aplicaba y queda en `NO`, la migración no debe considerarse cerrada.

---

## 1. Identificación de la pieza legacy

- [ ] La pieza legacy está identificada de forma explícita.
- [ ] Su ubicación original está identificada.
- [ ] Está claro qué comportamiento o valor se pretende rescatar.
- [ ] Está claro si se migra una pieza concreta y no un bloque ambiguo.
- [ ] El alcance de la migración está cerrado.

---

## 2. Clasificación obligatoria

- [ ] La pieza fue clasificada antes de reutilizarse.
- [ ] La clasificación usa uno de los estados oficiales:
  - `reusable`
  - `refactor-required`
  - `extract-only`
  - `discard`
- [ ] La clasificación está justificada.
- [ ] No se reutilizó código antes de decidir su estado.
- [ ] Si la clasificación es `discard`, la pieza no se reutiliza.

---

## 3. Destino dentro del sistema nuevo

- [ ] El módulo destino está identificado.
- [ ] La capa destino es correcta según la arquitectura oficial.
- [ ] Está claro si el destino pertenece a `src/features/`, `src/lib/`, `src/components/` o `supabase/`.
- [ ] No se dejó el destino “provisional”.
- [ ] No se usó una carpeta genérica sin ownership claro.

---

## 4. Contrato objetivo

- [ ] Está claro qué contrato existente se respeta o qué contrato nuevo se crea.
- [ ] Los inputs relevantes están definidos.
- [ ] Los outputs relevantes están definidos.
- [ ] Está claro qué módulo será owner del resultado.
- [ ] Está claro quién consumirá el resultado.
- [ ] No se migró una pieza solo porque “ya existía”.

---

## 5. Refactor y adaptación

- [ ] Está claro si la pieza requería refactor.
- [ ] Se separó lógica de negocio de UI cuando hizo falta.
- [ ] Se mejoró tipado cuando fue necesario.
- [ ] Se eliminaron dependencias opacas o acoplamientos innecesarios.
- [ ] No se arrastró estructura vieja por comodidad.
- [ ] No se convirtió la migración en un rediseño global fuera de alcance.

---

## 6. Arquitectura y límites

- [ ] La pieza migrada encaja en la arquitectura oficial de ChefOS v3.
- [ ] La lógica de negocio quedó fuera de `src/app/`.
- [ ] La lógica de negocio quedó fuera de `src/components/`.
- [ ] `src/lib/` no se usó como cajón de sastre para dominio.
- [ ] Se respetaron límites de módulo.
- [ ] No se tocaron módulos no relacionados sin justificación clara.

---

## 7. Datos, permisos y tenancy

Completar cuando la pieza migrada toque datos, identity, acceso o acciones sensibles.

- [ ] Se evaluó el impacto en datos.
- [ ] Se evaluó el impacto en permisos.
- [ ] Se evaluó el impacto multi-tenant.
- [ ] Se evaluó el impacto en RLS cuando aplica.
- [ ] Se evaluó el impacto en RPCs cuando aplica.
- [ ] Se evaluó el impacto en Edge Functions cuando aplica.
- [ ] Está claro quién puede leer, crear, editar o ejecutar la funcionalidad migrada.
- [ ] No se asumió que las restricciones antiguas siguen siendo válidas sin revalidación.

---

## 8. Calidad del código resultante

- [ ] El código migrado es legible.
- [ ] Los nombres están alineados con el dominio actual.
- [ ] No se abusó de `any`.
- [ ] Los contratos importantes están tipados con claridad.
- [ ] La pieza resultante pertenece realmente al sistema nuevo.
- [ ] No quedó como copia maquillada del sistema viejo.

---

## 9. Validación y tests

- [ ] Se definió el nivel de testing requerido por la migración.
- [ ] Hay unit tests cuando la lógica lo requiere.
- [ ] Hay integration tests cuando el contrato o acceso a datos lo requiere.
- [ ] Hay e2e tests cuando el flujo completo lo requiere.
- [ ] Se validan escenarios denegados además del flujo feliz cuando corresponde.
- [ ] Se validan permisos y tenancy cuando corresponde.
- [ ] Los tests cubren comportamiento migrado y no solo implementación incidental.
- [ ] La validación es proporcional al riesgo de la migración.

---

## 10. Documentación de la migración

- [ ] Se evaluó si la migración requería actualización documental.
- [ ] La clasificación de la pieza quedó reflejada donde corresponde cuando aplica.
- [ ] El destino arquitectónico quedó documentado cuando corresponde.
- [ ] El contrato objetivo quedó documentado cuando corresponde.
- [ ] Se dejó rastro documental de qué se rescató y qué se descartó cuando aplica.
- [ ] No queda una decisión estructural importante de migración solo implícita en conversación, commit o PR.

---

## 11. Resultado funcional de la migración

- [ ] El comportamiento útil quedó preservado o mejorado.
- [ ] El resultado final encaja en el módulo correcto.
- [ ] La migración no dejó piezas críticas a medio mover.
- [ ] No quedaron dependencias ocultas del código antiguo.
- [ ] La funcionalidad migrada puede mantenerse dentro del stack actual.
- [ ] El cambio puede revisarse con claridad.

---

## 12. Señales de alerta

Marcar `NO` si ocurre cualquiera de estas situaciones.

- [ ] No se copió y pegó código viejo sin adaptación.
- [ ] No se movió una carpeta entera como falsa migración.
- [ ] No se reutilizaron internals antiguos sin reclasificación.
- [ ] No se abrió un refactor lateral no aprobado.
- [ ] No quedó código temporal sin plan.
- [ ] No se escondió deuda crítica como “luego se limpia”.

---

## 13. Definition of Done de la migración

- [ ] La pieza legacy fue identificada.
- [ ] La pieza fue clasificada.
- [ ] El destino quedó claro.
- [ ] El contrato quedó claro.
- [ ] La adaptación respeta la arquitectura oficial.
- [ ] Los tests requeridos existen.
- [ ] La documentación requerida existe cuando aplicaba.
- [ ] Permisos y tenancy fueron contemplados cuando aplicaban.
- [ ] La salida es concreta y verificable.
- [ ] La migración cumple definition of done.

---

## Resultado final

### Estado de la migración

- [ ] `DONE`
- [ ] `NOT DONE`

### Motivos de bloqueo si no está done

- 
- 
- 

### Observaciones finales

- 
- 
-
