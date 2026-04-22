# ChefOS v3 Migration Policy

## Objetivo

Este documento define la política oficial de migración de código legacy hacia ChefOS v3.

Su propósito es evitar que el sistema nuevo herede caos estructural del sistema anterior mediante:

- copy-paste de código viejo
- reutilización sin clasificación
- migraciones sin ownership
- migraciones sin contrato objetivo
- arrastre de estructura antigua
- refactors encubiertos dentro de migraciones
- migraciones sin validación suficiente
- migraciones sin documentación
- migraciones sin trazabilidad clara en Git y PR

Este documento es normativo.

---

## Principio central

En ChefOS v3, migrar no significa mover código viejo al repo nuevo.

Migrar significa:

- identificar una pieza concreta del legacy
- clasificarla
- decidir si merece vivir en el sistema nuevo
- ubicarla en el módulo y capa correctos
- adaptarla al contrato y arquitectura actuales
- validarla con tests proporcionales al riesgo
- documentarla cuando aplique
- hacerla entrar con trazabilidad clara al historial del proyecto

Si una pieza no puede pasar por este proceso, no debe migrarse.

---

## Regla base

Ninguna pieza legacy puede reutilizarse sin pasar antes por estas decisiones explícitas:

1. qué pieza exacta se está analizando
2. qué comportamiento aporta
3. qué clasificación recibe
4. qué módulo será owner del resultado
5. en qué capa debe vivir
6. qué contrato debe respetar o crear
7. qué parte se rescata y qué parte se descarta
8. qué validación requiere
9. qué documentación debe actualizarse
10. cómo entra a rama, commits y PR sin mezclar otras cosas

---

## Clasificaciones oficiales del legacy

Toda pieza legacy debe clasificarse en uno de estos cuatro estados.

### 1. `reusable`

La pieza puede migrarse con cambios mínimos.

Condiciones típicas:

- la lógica sigue siendo válida
- el acoplamiento es bajo
- el tipado es razonable o corregible con poco esfuerzo
- el encaje arquitectónico es claro
- los riesgos de permisos y tenancy están controlados

### 2. `refactor-required`

La pieza contiene valor, pero no puede entrar tal cual.

Condiciones típicas:

- mezcla responsabilidades
- depende de estructura vieja
- necesita rediseño parcial
- tiene tipado débil
- necesita separación clara entre dominio, UI e infraestructura

### 3. `extract-only`

Solo deben rescatarse partes concretas, no la unidad completa.

Condiciones típicas:

- hay reglas o fragmentos útiles
- la pieza completa está demasiado acoplada
- la estructura original no debe mantenerse
- conviene reimplementar tomando solo comportamiento puntual

### 4. `discard`

La pieza no debe reutilizarse.

Condiciones típicas:

- diseño incompatible con la arquitectura actual
- deuda demasiado alta
- lógica obsoleta
- riesgos funcionales o de seguridad
- costo de adaptación mayor que reimplementación limpia

---

## Reglas obligatorias de migración

1. No inventar arquitectura nueva para acomodar legacy.
2. No mover carpetas enteras como falsa migración.
3. No copiar y pegar código viejo sin adaptación.
4. No migrar varias piezas heterogéneas en una sola ejecución.
5. No tocar módulos no relacionados.
6. No usar `src/lib/` como destino por comodidad.
7. No arrastrar naming, estructura o acoplamiento viejo por inercia.
8. No asumir que permisos antiguos siguen siendo válidos.
9. No asumir que reglas de tenant antiguas siguen siendo válidos.
10. No cerrar una migración sin validación proporcional al riesgo.
11. No cerrar una migración si requería documentación y no la deja.
12. No cerrar una migración si no podría entrar con trazabilidad clara en Git y PR.

---

## Delimitación obligatoria de la pieza

Antes de decidir nada, debe quedar delimitado:

- archivo, carpeta o unidad concreta del legacy
- comportamiento exacto que aporta
- problema actual que resolvería en ChefOS v3
- alcance exacto de la migración
- qué queda explícitamente fuera

Está prohibido plantear migraciones del tipo:

- “migrar todo lo útil”
- “aprovechar varias piezas”
- “mover el módulo entero y limpiar después”
- “copiar primero y refactorizar luego”

---

## Validación obligatoria de ownership

Toda migración debe responder:

- qué módulo será owner del resultado
- por qué ese módulo es el owner correcto
- qué módulo no debe absorber esa lógica
- si hace falta contrato público con otro módulo
- qué dependencias autorizadas tendrá la pieza migrada

La estructura antigua no decide el ownership nuevo.

El ownership lo decide la arquitectura oficial actual.

---

## Validación obligatoria de capa destino

Toda migración debe definir explícitamente si el destino correcto es:

- `src/features/<module>/...`
- `src/lib/...`
- `src/components/...`
- `supabase/...`

### Regla crítica

`src/lib/` no puede usarse como destino por defecto para esconder dominio sin módulo.

La lógica de negocio debe vivir en el módulo correcto salvo justificación excepcional y explícita.

---

## Contrato objetivo obligatorio

Toda migración válida debe dejar claro:

- qué entrada recibe la pieza migrada
- qué salida produce
- qué contrato público usa o crea
- quién puede consumir ese contrato
- qué dependencias están autorizadas
- qué restricciones funcionales, de permisos o tenancy aplican

Una pieza sin contrato objetivo no está lista para migrarse.

---

## Adaptación obligatoria al sistema nuevo

Una migración real debe adaptar la pieza al sistema actual.

Eso puede implicar:

- renombrar
- separar responsabilidades
- reescribir partes
- redefinir tipos
- aislar acceso a datos
- eliminar acoplamientos
- rehacer validaciones
- encapsularla en contrato nuevo
- descartar fragmentos incompatibles

No es válido maquillar una copia antigua y llamarlo migración.

---

## Política específica sobre datos, permisos y tenancy

Cuando una pieza migrada afecte datos o acceso, debe revisarse explícitamente:

- impacto en esquema de datos
- impacto en RLS
- impacto en RPCs
- impacto en Edge Functions
- impacto en permisos
- impacto multi-tenant
- límites funcionales de acceso

No se pueden heredar supuestos viejos sin revalidación.

Toda restricción sensible debe reconsiderarse en el contexto actual del proyecto.

---

## Validación mínima obligatoria

Toda migración debe tener validación proporcional al riesgo.

Según aplique, debe incluir:

- unit tests
- integration tests
- e2e tests
- validación de permisos
- validación de tenancy
- validación de regresión funcional
- validación de escenarios denegados

No está permitido cerrar una migración con solo “parece funcionar”.

---

## Documentación obligatoria de la migración

Cuando aplique, la migración debe dejar rastro documental claro sobre:

- pieza migrada
- clasificación
- destino arquitectónico
- contrato objetivo
- qué se rescató
- qué se descartó
- qué validación protege la migración
- qué reglas cambiaron o se mantuvieron

La documentación puede afectar, según el caso:

- specs
- sprints
- prompts
- checklists
- skills
- documentación de contrato
- documentación de módulo
- documentación específica de migración

### Regla crítica

Ninguna decisión importante de migración debe quedar solo en conversación, commit o PR.

---

## Trazabilidad obligatoria en Git y PR

Toda migración debe poder entrar al historial del proyecto con foco claro.

Debe ser posible identificar:

- rama de migración
- commits coherentes
- PR con contexto suficiente
- pieza legacy afectada
- clasificación aplicada
- destino elegido
- tests incluidos
- documentación actualizada cuando aplica

### No válido

- migración escondida dentro de un PR genérico
- commits ambiguos
- mezcla de varias migraciones distintas
- PR que no explica qué se migró realmente

---

## Señales de buena migración

Una buena migración en ChefOS v3:

- parte de una pieza concreta
- clasifica antes de reutilizar
- decide owner y capa con criterio
- crea o respeta un contrato claro
- rescata solo lo que merece vivir
- descarta lo que no encaja
- valida riesgos reales
- deja rastro documental suficiente
- entra con trazabilidad clara en Git

---

## Señales de mala migración

Se consideran señales de mala migración:

- copy-paste sin adaptación
- carpeta movida casi entera
- naming heredado sin criterio
- internals viejos expuestos como contrato nuevo
- dependencia fuerte de estructura antigua
- falta de clasificación
- falta de tests
- falta de documentación requerida
- PR opaco o mezclado
- “ya se limpiará después”

---

## Qué no debe hacerse nunca

Nunca debe hacerse esto:

- copiar primero y refactorizar después sin control
- reutilizar porque “ahorra tiempo”
- usar legacy como excusa para abrir rediseños globales
- convertir una migración puntual en reestructuración masiva
- mezclar migración y feature no relacionada en la misma unidad
- cerrar la migración solo porque compiló o pasó una prueba manual

---

## Relación con Definition of Done

Una migración solo puede considerarse done cuando:

- la pieza fue identificada
- la clasificación está clara
- el destino es correcto
- el contrato está claro
- la adaptación respeta arquitectura
- la validación es suficiente
- la documentación requerida existe cuando aplica
- la trazabilidad en Git y PR es correcta cuando aplica

Si cualquiera de estos puntos falla, la migración no está cerrada.

---

## Preguntas obligatorias antes de aprobar una migración

Antes de considerar aprobable una migración, debe poder responderse:

- ¿qué pieza exacta se migró?
- ¿qué clasificación recibió?
- ¿por qué ese módulo es el owner correcto?
- ¿por qué esa capa es la correcta?
- ¿qué contrato usa o crea?
- ¿qué parte se rescató y cuál se descartó?
- ¿qué tests la protegen?
- ¿qué documentación se actualizó?
- ¿cómo quedó trazada en rama, commits y PR?
- ¿por qué esto es migración real y no copia maquillada?

Si alguna respuesta crítica es no o no está clara, la migración no debe aprobarse.

---

## Relación con otros documentos

Este documento debe leerse junto con:

- `/.ai/WORKFLOW.md`
- `/.ai/specs/architecture.md`
- `/.ai/specs/coding-standards.md`
- `/.ai/specs/testing-standards.md`
- `/.ai/specs/documentation-standards.md`
- `/.ai/specs/git-workflow.md`
- `/.ai/specs/definition-of-done.md`
- `/.ai/checklists/migration-checklist.md`
- `/.ai/prompts/migration.prompt.md`

---

## Estado de esta especificación

Este documento define la política oficial de migración de legacy en ChefOS v3.

Toda reutilización futura de código previo debe cumplir estas reglas de clasificación, destino, contrato, validación, documentación y trazabilidad.
