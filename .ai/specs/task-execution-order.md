# ChefOS v3 Task Execution Order

## Objetivo

Este documento define el orden oficial de ejecución de tareas dentro de un sprint, los scripts obligatorios que deben correrse, y la regla anti-deriva que protege el alcance del trabajo.

Su propósito es evitar:

- tareas saltadas sin justificar
- scripts omitidos por conveniencia
- desviación del sprint activo
- deuda oculta introducida por atajos
- cambios parciales marcados como cerrados

Este documento es normativo.

---

## Principios

1. Las tareas se ejecutan en orden.
2. Ningún script obligatorio se salta.
3. Toda desviación del sprint se registra como decisión explícita.
4. Lo mínimo viable gana frente a la sobreingeniería.
5. No se abre trabajo lateral sin aprobación.

---

## Scripts obligatorios

Los scripts definidos en `package.json` son contractuales. El agente debe poder ejecutarlos en cualquier momento sin configuración adicional.

Scripts mínimos obligatorios:

- `npm run dev` — servidor de desarrollo
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript strict
- `npm run test` — Vitest unit
- `npm run test:coverage` — Vitest con threshold ≥90% donde aplique
- `npm run test:e2e` — Playwright (mínimo en main/release)
- `npm run build` — build producción

Si un script falla, la tarea no puede cerrarse.

---

## Orden de ejecución dentro de un sprint

### 1. Fundación antes que módulos

El sprint 00 (foundation) debe cerrarse antes de abrir sprints 01-14. Los sprints 01-14 tienen dependencias explícitas entre sí (ver cada `sprints/sprint-XX-*.md`).

### 2. Dentro de un sprint

El orden oficial es:

1. Leer el sprint completo y confirmar alcance
2. Revisar dependencias declaradas
3. Verificar que specs relevantes estén disponibles
4. Ejecutar tareas en orden declarado en el sprint
5. Validar cada tarea contra `specs/definition-of-done.md`
6. Actualizar documentación cuando aplique
7. Cerrar tarea con commit + PR según `specs/git-workflow.md`

### 3. Regla de progreso tarea a tarea

Después de cada tarea:

- ejecutar `lint` + `typecheck` + `test`
- si falla cualquiera, reparar antes de continuar
- si el fallo requiere decisión estructural, registrarla en `decisions-log.md`

No se comienza una tarea si la anterior no está verde.

---

## Anti-deriva

Cuando una tarea necesita algo no especificado:

1. **Documentar** la necesidad en `specs/decisions-log.md`.
2. **Implementar lo mínimo viable** que resuelva la tarea actual.
3. **No abrir trabajo lateral** fuera del sprint activo.
4. **No introducir utilidades globales** sin justificación explícita.
5. **No tocar módulos no relacionados** "ya que estamos".

Está prohibido:

- ampliar el alcance sin acuerdo
- mezclar refactor con feature nueva
- corregir deuda lateral fuera del sprint activo
- mover piezas entre módulos por conveniencia
- generar arquitectura paralela

---

## Decisiones durante ejecución

Toda decisión que afecte contratos, ownership, arquitectura o reglas de permisos debe quedar escrita en `decisions-log.md` con:

- fecha
- contexto
- opciones consideradas
- opción elegida
- razón

Una decisión no queda registrada si solo vive en el código o en el PR.

---

## Señales de buena ejecución

- todas las tareas cerraron en verde
- no hubo saltos de script
- las decisiones están documentadas
- el alcance declarado coincide con el trabajo entregado
- los commits son trazables y revisables

---

## Señales de mala ejecución

- scripts omitidos "porque no aplicaba"
- tareas marcadas como done con tests en rojo
- decisiones tomadas solo en código
- alcance ampliado sin justificación
- deuda técnica oculta como "temporal"

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/agent-responsibilities.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/decisions-log.md`
- `/.ai/specs/ci-standards.md`

---

## Estado de esta especificación

Este documento define el orden oficial de ejecución de tareas en ChefOS v3.

Todo trabajo que no siga este orden debe ser cuestionado en revisión.
