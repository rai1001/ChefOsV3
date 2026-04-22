---
name: production-module-improvements
description: 10 mejoras priorizadas para el módulo production. Alimenta Sprint 07. Separa MVP 1/2/3 según impacto y esfuerzo.
---

## Base obligatoria

Antes de aplicar estas mejoras:

- `.ai/sprints/sprint-07-production.md` — alcance del sprint
- `.ai/specs/module-template.md` — estructura del módulo
- `.ai/skills/production/` — skill base del módulo

---

## Alcance

Esta skill NO es una tarea a ejecutar — es un banco de propuestas.

El equipo al abrir sprint-07 decide cuáles entran:

- **MVP 1**: incluidas en el sprint base
- **MVP 2**: sprint posterior (post-lanzamiento)
- **MVP 3**: mejora futura

---

## 1 · Separar tareas de elaboraciones (MVP 1)

**Problema**: mezclar tareas operativas con elaboraciones (recetas) complica compras/inventario.

**Propuesta**: campo `tipo_tarea` con opciones:
- **elaboracion** (receta con cantidades y rendimiento — impacta compras/inventario)
- **operativa** (limpieza, orden, mise en place general — no impacta inventario)
- **control** (verificación/firmas: etiquetado, temperatura, cierre — genera evento compliance)

**Beneficio**: solo las elaboraciones impactan en compras/inventario. Las operativas no contaminan cálculos.

**Estado en schema v2**: ya previsto.

---

## 2 · Checklists inteligentes (MVP 2 — alto valor, bajo esfuerzo)

**Casos típicos**: "Cierre de cocina", "Revisar etiquetado", "Apertura turno mañana".

**Propuesta**: subtareas tipo checkbox dentro de una tarea.

Ejemplo "Revisar etiquetado":
- [ ] Etiquetas con fecha
- [ ] Etiquetas legibles
- [ ] Productos sin caducar

**Beneficio**: mejora ejecución real, reduce olvidos, facilita auditorías APPCC.

---

## 3 · Asignación por rol sin persona (MVP 3)

**Problema**: a veces no se sabe quién estará, pero sí el puesto.

**Propuesta**: permitir asignación a:
- persona concreta
- turno
- **rol/puesto** (ej. "partida caliente", "ayudante")

**Beneficio**: planificación flexible y realista.

---

## 4 · Dependencias y bloqueos simples (MVP 3)

**Ejemplo**: "Envasar salsa" no puede iniciar hasta "Reducir fondo".

**Propuesta**: campo `bloqueada_por_tarea_id`. UI con indicador "Bloqueada" + motivo.

**Beneficio**: evita errores de secuencia y retrabajo.

---

## 5 · Reglas anti-abuso en móvil (MVP 1)

**Problema**: marcar "Terminado" sin hacerlo desvirtúa datos.

**Propuesta mínima**:
- No permitir `Terminado` sin pasar por `En proceso`
- Registrar timestamps: `hora_inicio`, `hora_fin`
- (Opcional) pedir comentario si se termina "demasiado rápido"

**Beneficio**: datos fiables, control sin fricción.

**Aplicación**: state machine en RPC `transition_production_task`, validación en cliente + servidor.

---

## 6 · Alertas automáticas (MVP 2)

**Ejemplo**: "Elaboración base salsa aún no iniciada — evento hoy 20:30".

**Propuesta**: alertas al jefe cuando:
- tarea crítica no inicia antes de cierta hora
- tarea bloqueada demasiado tiempo
- tarea pendiente cerca del deadline

**Beneficio**: anticipación, menos incendios.

**Aplicación**: agente `production_supervisor` (sprint-14).

---

## 7 · Cierre de turno / cierre de día (MVP 2)

**Problema**: tareas "fantasma" que nadie retoma.

**Propuesta**: acción `Cerrar turno` con:
- lista de tareas pendientes
- opciones: mover a siguiente turno / reasignar / marcar no realizada (con motivo)

**Beneficio**: continuidad operativa.

---

## 8 · Historial y trazabilidad (MVP 1 — básico)

**Guardar**:
- quién crea la tarea
- quién la ejecuta
- cuándo inicia/termina
- re-aperturas y cambios

**Beneficio**: auditoría, métricas reales, mejora continua.

**Aplicación**: `audit_trigger_fn()` en `production_tasks`.

---

## 9 · UX móvil — 1 pantalla principal (MVP 1)

**Principio**: el personal no debe navegar.

**Propuesta**: pantalla "Hoy / Mi semana":
- tareas del turno
- orden: 1) críticas primero, 2) por hora objetivo
- botones grandes: ▶️ Iniciar · ✅ Terminar

**Beneficio**: reduce fricción en cocina real con guantes.

---

## 10 · Resumen de prioridades

### Mantener (MVP 1 ya bien definido en v2)
- Doble vista: jefe vs personal
- Tareas manuales y repetitivas
- Estados simples

### Añadir pronto (MVP 1-2)
- Separar tareas/elaboraciones (ya previsto)
- Reglas de estados + timestamps (anti-abuso)
- Historial básico
- Checklists
- Cierre de turno

### Añadir más adelante (MVP 3)
- Dependencias entre tareas
- Asignación por rol
- Alertas automáticas avanzadas (vía agente)

---

## Cómo usar esta lista al planear sprint-07

1. Leer `sprints/sprint-07-production.md` para ver alcance actual.
2. De las 10 propuestas, marcar con [x] las que entran en el sprint.
3. Mover las no elegidas a `ROADMAP` del sprint o a sprint-07 follow-up.
4. Registrar decisión en `decisions-log.md` si se descarta una propuesta permanentemente.

---

## Relación con otros documentos

- `/.ai/sprints/sprint-07-production.md`
- `/.ai/specs/module-template.md`
- `/.ai/skills/production/` (skill base del módulo)
- `/.ai/specs/core-constraints.md` (state machines en DB)
