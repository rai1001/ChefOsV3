# Revisión rápida de base de código — tareas propuestas

Fecha de revisión: 2026-04-27

## 1) Tarea: corregir error tipográfico

**Problema detectado**
- En `.env.example` aparece el texto `Nunca commitees .env...`, con un término no estándar/inconsistente.

**Tarea propuesta**
- Sustituir `commitees` por una redacción consistente en español (por ejemplo: `Nunca hagas commit de .env...`) para mejorar claridad y profesionalidad de la guía.

**Criterio de aceptación**
- El comentario inicial de `.env.example` queda corregido y legible para todo el equipo.

---

## 2) Tarea: solucionar un fallo funcional (validación de cursor)

**Problema detectado**
- `parseCursor` usa `Number.parseInt(cursor, 10)`, lo que acepta entradas parcialmente numéricas como `"10abc"` y devuelve `10`.
- Ese comportamiento puede permitir cursores malformados y paginación incoherente.

**Tarea propuesta**
- Endurecer `parseCursor` para aceptar únicamente enteros positivos puros (p. ej. usando regex `^\\d+$` antes de convertir).

**Criterio de aceptación**
- Entradas como `"10abc"`, `" 10"`, `"10 "` o `"1.5"` devuelven `0`.
- Entradas válidas como `"0"`, `"50"` se mantienen compatibles.

---

## 3) Tarea: corregir discrepancia de documentación

**Problema detectado**
- El árbol de arquitectura en `README.md` sigue mencionando `src/middleware.ts`, pero el archivo real en el repositorio es `src/proxy.ts`.

**Tarea propuesta**
- Actualizar el bloque de estructura en `README.md` para reflejar `src/proxy.ts` y evitar confusión durante onboarding/mantenimiento.

**Criterio de aceptación**
- El árbol documental coincide con la estructura real del proyecto.

---

## 4) Tarea: mejorar una prueba (cobertura de regresión)

**Problema detectado**
- La suite de paginación no cubre el caso de cursor mixto (`"10abc"`), por lo que el fallo descrito arriba puede pasar desapercibido.

**Tarea propuesta**
- Añadir pruebas en `src/lib/pagination/pagination.test.ts` que validen cursores malformados y espacios alrededor del valor.

**Criterio de aceptación**
- Existe al menos un test que falla con la implementación actual y pasa tras endurecer `parseCursor`.
