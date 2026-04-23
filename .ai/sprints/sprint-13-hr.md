# ChefOS v3 Sprint 13 - HR

## Objetivo del sprint

Construir la base funcional inicial del módulo `hr` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de recursos humanos del sistema.

Este sprint no existe para resolver toda la gestión de personal del producto.

Existe para definir y estabilizar la primera base operativa del módulo `hr`.

---

## Estado del sprint

- Módulo principal: `hr`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `hr`

El módulo `hr` es responsable del dominio de recursos humanos dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- entidad base de personal interno
- asignación funcional mínima de personal
- estado base de personal
- datos mínimos operativos de recursos humanos
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de identidad, commercial, compliance o automation.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `hr` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad base de personal del dominio
- su estado funcional inicial
- sus datos mínimos operativos
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `hr` que permita:

- encapsular la lógica mínima del dominio de recursos humanos
- exponer contratos públicos base del módulo
- evitar acceso caótico a datos de personal desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de `hr`
- permitir que futuros módulos consuman `hr` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `hr`
- definición de frontera pública del módulo
- definición de contratos base del dominio de recursos humanos
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad base de personal y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- sistema completo de estructura organizativa
- gestión completa de turnos, horarios o nómina
- automatizaciones de personal
- reporting transversal de recursos humanos
- integraciones externas de RRHH
- compliance transversal del personal
- migración masiva de legacy de `hr`
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `hr`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

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
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `hr`.
2. Evitar acceso improvisado a datos de personal desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de `hr` se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia de recursos humanos del sistema.
2. Toda la relación entre `hr` e `identity`.
3. Toda la relación entre `hr` y `compliance`.
4. Toda la automatización asociada a procesos de personal.
5. Integraciones externas del dominio de `hr`.
6. Reestructuración global de módulos fuente o consumidores.

---

## Dependencias del sprint

Este sprint depende de que los sprints anteriores ya hayan dejado cerrados:

- workflow oficial
- arquitectura oficial
- standards de código
- standards de testing
- política de migración
- definition of done
- plantilla oficial de módulos
- contrato base de `identity` para contexto de acceso y tenant

---

## Entregables del sprint

Los entregables esperados de Sprint 13 son los mínimos necesarios para dejar una base estable del módulo `hr`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad base de personal
- estado base del personal
- consulta de entidad de `hr` por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/hr/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de personal
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 13 solo se considera cerrado cuando:

- `hr` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad base de personal no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de `hr`.

---

## Tareas del sprint

### Tarea 13.01 - Definir responsabilidad exacta del módulo hr

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 13.02 - Definir contrato público base de hr

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 13.03 - Definir entidad base de personal y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de recursos humanos sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de `hr` definido por contrato

### Tarea 13.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de `hr`

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 13.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 13.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `hr` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de recursos humanos

- **Mitigación:** limitar el sprint al contrato base y a la entidad mínima del módulo

### Riesgo 2. Mezclar hr con identity, commercial, compliance o automation

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir hr

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de hr en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/hr/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 13, debe poder responderse:

- ¿está claro qué pertenece a `hr`?
- ¿el resto del sistema puede consumir `hr` sin invadir internals?
- ¿la entidad base de personal y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 13 no está cerrado.

---

## Definition of Done del sprint

Sprint 13 está done solo cuando:

- el módulo `hr` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad base de personal está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 13, el proyecto debería quedar listo para que módulos posteriores puedan consumir `hr` con un contrato estable, en lugar de resolver datos o procesos básicos de personal de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 13 oficial del módulo `hr` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_PERSONAL_HORARIOS.md` de v2. Migración `00026_m13_hr`.

### Funcionalidades principales

Gestión de personal operativo + turnos + generación automática de horarios basada en reglas. **No gestiona nóminas ni contratos laborales.**

- **Personal**: alta, roles (principal + secundarios), horas semanales objetivo, disponibilidad.
- **Turnos**: bloques horarios reutilizables (mañana, tarde, noche, refuerzo).
- **Reglas de horario**: por rol + día + turno + personas mín/máx.
- **Generación automática mensual**: calcula necesidades base → incrementa por eventos/picos producción → asigna personal respetando horas objetivo → propone `HorarioPropuesto`.
- **Ajuste semanal manual**: drag-drop.
- **Anti-caos**: no solapar turnos, no superar horas permitidas, registrar excepciones.
- **Vista móvil**: "Mi horario" solo lectura.

### Modelo de datos

- `Personnel` — hotel_id, user_id (opcional), nombre, rol_principal, roles_secundarios (array), tipo_contrato, horas_semanales_objetivo, disponibilidad (jsonb), activo.
- `ShiftDefinition` — hotel_id, nombre (mañana|tarde|noche|refuerzo), hora_inicio, hora_fin, tipo (normal|refuerzo|evento), activo.
- `ScheduleRule` — hotel_id, rol, dias_semana[] (L|M|X|J|V|S|D), shift_definition_id, personas_minimas, personas_maximas, prioridad (normal|alta), activa.
- `ScheduleAssignment` — hotel_id, fecha, shift_definition_id, personnel_id, origen (regla|evento|ajuste), estado (propuesto|confirmado|reemplazado).

### State machine (ScheduleAssignment)

`propuesto → confirmado` (con opción reemplazado si se reasigna).

### Contratos públicos (`src/features/hr/index.ts`)

Types: `Personnel`, `PersonnelRole`, `ContractType`, `ShiftDefinition`, `ShiftType`, `ScheduleRule`, `ScheduleAssignment`, `ScheduleOrigin`, `ScheduleStatus`, `SCHEDULE_STATUS_VARIANT`, `PERSONNEL_ROLES`.

Hooks:

- `usePersonnel(filters?)`, `usePerson(id)`
- `useCreatePerson()`, `useUpdatePerson()`
- `useShiftDefinitions()`, `useCreateShiftDefinition()`, `useUpdateShiftDefinition()`
- `useScheduleRules()`, `useCreateScheduleRule()`, `useUpdateScheduleRule()`, `useDeleteScheduleRule()`
- `useGenerateMonthlySchedule(month)` — admin+
- `useScheduleAssignments(fromDate, toDate)`
- `useUpdateAssignment()`, `useDeleteAssignment()`
- `useMyShifts()` — personal ve su horario

### Casos de uso (`application/`)

- `use-hr.ts`, `use-personnel.ts`, `use-person.ts`
- `use-create-person.ts`, `use-update-person.ts`
- `use-shift-definitions.ts`
- `use-schedule-rules.ts`, `use-update-schedule-rule.ts`, `use-delete-schedule-rule.ts`
- `use-generate-monthly-schedule.ts`
- `use-schedule-assignments.ts`
- `use-my-shifts.ts`

### RPCs consumidas

- `create_personnel`, `update_personnel`
- `create_shift_definition`, `update_shift_definition`
- `create_schedule_rule`, `update_schedule_rule`, `delete_schedule_rule`
- `generate_monthly_schedule(p_hotel_id, p_month)` — asigna respetando reglas + horas + disponibilidad, emite `schedule.generated`
- `update_assignment`, `delete_assignment`
- `get_personnel`, `get_shift_definitions`, `get_schedule_rules`, `get_schedule_assignments`
- `check_membership(uuid)` overload para HR (00030)

### Eventos de dominio

Emite: `personnel.created`, `personnel.updated`, `schedule.generated`, `shift_assignment.updated`.

Consume: `evento.confirmed` (considerar refuerzo si pax elevado), `tarea_produccion.created` (consulta disponibilidad).

### Tests mínimos

Unit: cálculo de horas semanales por persona, anti-solapamiento de turnos, validación personas_minimas.

Integration: generate_monthly_schedule con evento + producción pico incrementa refuerzo correctamente, excepción manual registra auditoría.

E2E: crear personal + turnos + reglas → generar mes → ajustar semana drag-drop → cocinero ve su horario en móvil.

### Criterio de done específico

- [ ] Generación mensual en <30s para hotel con 20 empleados + 50 eventos.
- [ ] Anti-solapamiento server-side: dos turnos solapados mismo día → rechazo.
- [ ] Alertas: "falta personal en turno crítico" con urgent, "persona supera horas" con warning.
- [ ] Vista mensual con color: completo/justo/déficit (semáforo).
- [ ] Mobile "Mi horario" solo lectura, sin edit.
- [ ] Registros de cambio con auditoría (quién/cuándo/por qué).

### Referencias cruzadas

- `sprints/sprint-02-commercial.md` — eventos disparan cálculo de refuerzo
- `sprints/sprint-07-production.md` — producción consulta horarios para asignación
- `sprints/sprint-11-notifications.md` — alertas de déficit/sobrecarga
- `skills/hr/`
