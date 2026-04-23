# ChefOS v3 Module Checklist

## Objetivo

Esta checklist sirve para validar creación, migración, refactor o ampliación de un módulo en ChefOS v3.

Debe usarse antes de dar por cerrado cualquier trabajo que afecte un módulo de negocio.

No sustituye las specs. Las aterriza en una revisión operativa concreta.

---

## Instrucciones de uso

Esta checklist debe responderse con criterio estricto.

Estados sugeridos por ítem:

- `OK`
- `NO`
- `N/A`

Si un punto crítico aplicaba y queda en `NO`, el trabajo no debe considerarse cerrado.

---

## 1. Identidad del módulo

- [ ] El módulo afectado está identificado explícitamente.
- [ ] El nombre del módulo coincide con un módulo oficial del sistema o con una decisión ya aprobada.
- [ ] La responsabilidad principal del módulo está clara.
- [ ] El alcance del cambio dentro del módulo está definido.
- [ ] Está claro qué queda fuera del alcance.

---

## 2. Ownership y límites

- [ ] Está claro que este módulo es el owner correcto de la lógica modificada o creada.
- [ ] No se introdujo lógica que en realidad pertenece a otro módulo.
- [ ] No se tocaron internals de otros módulos sin contrato público.
- [ ] No se crearon dependencias laterales innecesarias.
- [ ] No se introdujeron dependencias circulares.

---

## 3. Encaje con la arquitectura oficial

- [ ] El cambio respeta la arquitectura oficial del repositorio.
- [ ] La lógica de negocio quedó en `src/features/`.
- [ ] No se metió lógica de negocio en `src/app/`.
- [ ] No se metió lógica de negocio en `src/components/`.
- [ ] No se usó `src/lib/` como cajón de sastre para lógica de dominio.
- [ ] La ubicación final de cada archivo es coherente con su responsabilidad.

---

## 4. Estructura del módulo

- [ ] El módulo tiene una frontera pública clara.
- [ ] Lo público y lo interno están razonablemente diferenciados.
- [ ] La estructura del módulo es proporcional a su tamaño y complejidad.
- [ ] No se creó una estructura artificialmente compleja.
- [ ] Tampoco se mezclaron responsabilidades por simplificar en exceso.

---

## 5. Contratos públicos

- [ ] Está claro qué expone públicamente el módulo.
- [ ] Los contratos públicos están tipados de forma explícita.
- [ ] Los consumers no dependen de internals del módulo.
- [ ] Inputs y outputs relevantes están claros.
- [ ] Si cambió un contrato, el impacto está identificado.

---

## 6. Dominio y lógica funcional

- [ ] La lógica principal del cambio pertenece realmente al dominio del módulo.
- [ ] Las reglas de negocio están separadas de la UI.
- [ ] Las validaciones relevantes están ubicadas con criterio.
- [ ] No se mezcló comportamiento funcional con render o composición visual.
- [ ] El diseño evita acoplamiento innecesario entre dominio, UI e infraestructura.

---

## 7. Datos, permisos y tenancy

- [ ] Se evaluó si el cambio afecta datos.
- [ ] Se evaluó si el cambio afecta permisos.
- [ ] Se evaluó si el cambio afecta tenancy.
- [ ] Se evaluó si el cambio afecta RLS, RPCs o Edge Functions cuando aplica.
- [ ] Está claro quién puede leer, crear, editar o ejecutar la funcionalidad afectada.
- [ ] No se asumió acceso sin validación explícita.

---

## 8. Acceso a datos e infraestructura

- [ ] El acceso a datos del módulo está encapsulado con criterio.
- [ ] No se dispersaron queries o mutaciones por componentes o páginas.
- [ ] La infraestructura sirve al módulo y no define el dominio.
- [ ] No se introdujeron acoplamientos técnicos opacos.
- [ ] Si hubo cambio de datos, el impacto estructural quedó identificado.

---

## 9. Código y maintainability

- [ ] El código resultante es legible.
- [ ] Los nombres son claros y orientados al dominio.
- [ ] No se abusó de `any`.
- [ ] Los tipos importantes están definidos explícitamente.
- [ ] Las funciones son razonablemente pequeñas y enfocadas.
- [ ] No se introdujeron utilidades genéricas sin ownership claro.
- [ ] El cambio no degrada la mantenibilidad del módulo.

---

## 10. Legacy y migración

Completar solo si hubo reutilización de código previo.

- [ ] La pieza legacy fue identificada.
- [ ] La pieza legacy fue clasificada antes de reutilizarse.
- [ ] El destino dentro del sistema nuevo quedó claro.
- [ ] No se copió y pegó código viejo sin adaptación.
- [ ] Se evitó arrastrar estructura antigua por comodidad.
- [ ] El comportamiento migrado quedó alineado con la arquitectura oficial.
- [ ] La migración tiene tests o validación suficiente según riesgo.

---

## 11. Testing

- [ ] Se definió el nivel de testing requerido por el cambio.
- [ ] Hay unit tests cuando la lógica lo requiere.
- [ ] Hay integration tests cuando el contrato o la colaboración entre capas lo requiere.
- [ ] Hay e2e tests cuando el flujo completo lo requiere.
- [ ] Se validaron escenarios denegados además del flujo feliz cuando aplica.
- [ ] Se validaron permisos y tenancy cuando aplica.
- [ ] Los tests son legibles y mantenibles.
- [ ] La cobertura aportada reduce riesgo real de regresión.

---

## 12. Documentación

- [ ] Se evaluó si el cambio del módulo requería actualización documental.
- [ ] La documentación requerida fue actualizada cuando aplica.
- [ ] Los cambios de ownership del módulo dejaron rastro documental claro cuando corresponde.
- [ ] Los cambios de contrato público dejaron rastro documental claro cuando corresponde.
- [ ] Los cambios en límites, responsabilidades o fuera de alcance del módulo quedaron reflejados donde correspondía.
- [ ] No queda una decisión estructural importante solo implícita en conversación, commit o PR.

---

## 13. Review estructurada

- [ ] El cambio puede revisarse con claridad.
- [ ] El alcance real coincide con el alcance declarado.
- [ ] No hubo expansión lateral injustificada.
- [ ] La implementación respeta arquitectura y standards.
- [ ] El módulo sigue teniendo límites claros después del cambio.
- [ ] No queda deuda crítica oculta.

---

## 14. Definition of Done

- [ ] La salida del trabajo es concreta y verificable.
- [ ] El módulo sigue siendo coherente con su responsabilidad.
- [ ] El cambio está en la capa correcta.
- [ ] Los contratos relevantes están claros.
- [ ] Los tests requeridos existen.
- [ ] La documentación requerida existe cuando aplicaba.
- [ ] Permisos y tenancy fueron contemplados cuando aplicaba.
- [ ] No queda trabajo crítico escondido como “temporal”.
- [ ] El cambio cumple definition of done.

---

## Resultado final

### Estado del checklist

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
