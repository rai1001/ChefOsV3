# Skill — design-system-rollout

## Propósito

Plan operativo para aplicar progresivamente el design system **Industrial Control Surface** de ChefOS v3 a todas las pantallas de la app, en fases controladas y con criterios de cierre claros.

## Cuándo usar

- Cuando se arranca una nueva pantalla y se quiere alinear con el DS desde el primer commit.
- Cuando se audita una pantalla existente y se detectan clases light-mode o tokens divergentes.
- Cuando se introduce un módulo nuevo (sprint) y se quiere verificar que respeta el DS antes de cerrar.
- Cuando se añade un nuevo status enum (p. ej. `WHATEVER_STATUS`) y hay que mapearlo a `*_VARIANT`.

## Referencia

Basado en la migración validada en v2 (5 fases, F0-F5, cerrada sesión 15 abril 2026).
