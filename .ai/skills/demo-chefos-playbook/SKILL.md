---
name: demo-chefos-playbook
description: Guion paso a paso para demostrar ChefOS v3 a cliente potencial. Incluye setup, checklist pre-demo, guion 40 min, plan B, objeciones y cierre.
---

## Base obligatoria del proyecto

Antes de usar esta skill, confirmar:

- `.ai/README.md` — stack + principios
- `.ai/specs/design-tokens.md` — la UI debe verse como el design system define
- Hotel demo sembrado con `npm run db:seed:demo`

---

## Alcance cerrado

Esta skill cubre:

- preparación de la demo
- ejecución de la demo (40 min)
- cierre + follow-up

NO cubre:

- marketing pre-demo (atraer al cliente)
- onboarding post-firma
- soporte continuo

---

## 0 · Setup (noche anterior)

### Datos clave a preparar

| Campo             | Valor                                     |
| ----------------- | ----------------------------------------- |
| URL producción    | [https://chefos-v3.vercel.app]            |
| Hotel demo        | Definido por cliente (ej. "Hotel X Demo") |
| Hotel ID          | UUID del hotel sembrado                   |
| Fecha evento demo | Un evento confirmed con datos realistas   |

### Credenciales (NO commitear)

Usar plantilla `.local` gitignored. Tres perfiles:

| Perfil    | Email                          | Cuándo                        |
| --------- | ------------------------------ | ----------------------------- |
| Admin     | `demo-admin@<cliente>.es`      | Recomendado — ve todo         |
| Head Chef | `demo-head-chef@<cliente>.es`  | Si pide vista chef            |
| Comercial | `demo-commercial@<cliente>.es` | Si viene alguien de banquetes |

### Checklist pre-demo (15 min antes)

```
[ ] Abrir https://chefos-v3.vercel.app en Chrome limpio
[ ] Login con demo-admin
[ ] Dashboard carga con datos (banda de mando + KPIs reales)
[ ] Pestaña 2: /events/<id-evento> lista
[ ] Pestaña 3: /procurement con PO en 'sent' lista para OCR
[ ] Foto de albarán real en móvil/carpeta (JPG/PNG ≤10MB)
[ ] Silenciar notificaciones Windows/macOS
[ ] Cargador + wifi del sitio verificado
[ ] Café, respirar
```

---

## 1 · Guion (40 min)

### Apertura (2 min)

> "Antes de enseñarte nada, una pregunta: ¿cuántas horas a la semana dedica tu equipo de cocina a escandallos, compras y albaranes, sin contar cocinar?"

(Escucha 30 s.)

> "En los hoteles con los que hablamos son 10-25h. Lo que vas a ver reduce esto a 2-3h. El diferencial clave: lee albaranes con foto y actualiza costes automáticamente."

### Acto I — Dashboard (3 min)

Navegar: `/dashboard`

Señalar:

1. **Banda de mando** — Turno · Servicio · Siguiente acción. "Lo primero que ve el head chef al entrar."
2. **KPIs** — datos vivos, no hay que pulsar nada.
3. **Feed operativo** — verde si todo OK, tintado si algo bloquea. "El rojo quiere decir acción antes del próximo servicio."

Frase clave: _"Un hotel de 4★ no necesita otro ERP. Necesita una pantalla que le diga qué está mal hoy."_

### Acto II — Evento (6 min)

Navegar: `/events` → click evento demo

Señalar:

1. Cliente + fecha + pax (commercial lo crea en 2 clicks)
2. Menú asignado → "Ver BEO" → descarga PDF
3. Coste estimado en EUR + food cost % proyectado — con precios del **último albarán**
4. Botón "Generar workflow de producción" → 1 segundo

Frase clave: _"El BEO ya existe el momento que commercial cierra la venta."_

### Acto III — Escandallos en vivo (5 min)

Navegar: `/escandallos` (simulador)

En vivo:

1. Nombre plato + raciones + PVP objetivo
2. Buscar ingredientes → mostrar tags de precio (albarán verde, oferta azul, manual gris)
3. Panel derecho: coste/ración + food cost % vs objetivo + margen

Frase clave: _"Tu head chef sabe si fue rentable ANTES del servicio, no la semana que viene."_

### Acto IV — Compras + OCR (8 min) ★ CLIMAX

Navegar: `/procurement` → PO en "sent"

Paso 1 (1 min): "El pedido ya lo aprobó el chef. Mira lo que hace ahora."

Paso 2 (2 min): Subir foto del albarán → procesa (4-6 s). _"Claude Sonnet leyendo la foto. Extrae líneas, cantidades, lotes, caducidades, precios."_

Paso 3 (2 min): Resultado — "N líneas: X auto-matched, Y pendientes". Si hay cambio de precio → _"Escandallos recalculados. Food cost vivo, sin pedir nada a nadie."_

Paso 4 (2 min): Revisar pendientes en `/procurement/ocr-review` → sugerencias con confidence → aceptar/rechazar.

Paso 5 (1 min): `/inventory` → producto ya aparece con stock y caducidad.

Frase clave: _"Los otros te piden teclear el albarán. Nosotros lo leemos con la foto y mantenemos tus costes vivos."_

### Acto V — Inventario + alertas (4 min)

Navegar: `/inventory`

Señalar:

1. KPIs arriba — alertas tintadas si hay
2. Row tintada — producto crítico
3. Tab "Solo alertas"
4. (Opcional) `/inventory/forensics` — _"Si el food cost no cuadra, aquí se ve qué lote, cuándo, en qué servicio."_

### Acto VI — Producción (3 min)

Navegar: `/production/kanban` + `/production/mise-en-place` + `/production/kds/cocina_caliente`

Frase clave: _"Todo se generó solo cuando commercial confirmó. El chef no planifica, ejecuta."_

### Acto VII — APPCC + Trazabilidad (2 min)

Navegar: `/compliance/appcc` + `/compliance/trace/search`

Frase clave: _"Inspector entra un lunes. Excel: 3 horas. Aquí: 3 segundos. Con firma digital y timestamp inmutable."_

### Cierre (5 min)

> "Con lo que has visto — ¿qué es lo que más dolor quita a tu operación hoy?"

(Cállate. 90 segundos mínimo.)

| Si dice...          | Propón...                                                    |
| ------------------- | ------------------------------------------------------------ |
| "OCR/albaranes"     | Piloto 30 días gratis: 10 albaranes reales, informe al final |
| "BEO/coordinación"  | Piloto 5 eventos reales en 30 días                           |
| "food cost real"    | Onboarding 2 semanas + auditoría food cost 3 meses           |
| "interesante pero…" | Call con tu head chef la semana que viene                    |

**Pricing (solo si preguntan):**

- 290 €/mes hotel ≤40 hab / 1 cocina
- 490 €/mes hotel 40-80 hab / 2 cocinas
- 890 €/mes >80 hab / multi-cocina
- OCR incluido (coste Claude ~0.01 €/albarán)
- Piloto 30 días: 0€. Implantación 1500€ única

Cierre duro: _"¿Qué te impediría firmar hoy un piloto de 30 días gratis?"_

---

## 2 · Plan B

| Falla            | Plan B                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------- |
| Vercel caído     | `npm run dev` local + ngrok. Si no hay tiempo: screenshots carpeta `/demo-screenshots` |
| Login falla      | Verificar `.env.local` Vercel. Timeout → otro usuario demo                             |
| OCR error / >20s | "Anthropic a veces rate-limita en demo" → abrir orden con GR ya procesado              |
| Dashboard vacío  | `npm run db:seed:demo` — 5 min corte                                                   |
| KDS vacío        | SQL manual insert `kitchen_orders` — tener script a mano                               |
| Sin internet     | Hotspot móvil. Si falla → screenshots + "te mando acceso esta tarde"                   |

---

## 3 · Preguntas típicas

- **"¿Integra con mi PMS (Opera/Mews)?"** — "Hoy no. Los hoteles nos dijeron que el dolor no es sincronizar PMS, es no tener datos de cocina. Cuando eso llegue, nos integramos."
- **"¿Si mi chef no es digital?"** — "KDS táctil, botones grandes. La foto del albarán es lo único nuevo: 15 min."
- **"¿Dónde están mis datos?"** — "Supabase Frankfurt. Cifrado. GDPR. Firmo DPA."
- **"¿Cuánto tarda arrancar?"** — "2 semanas. Semana 1: cargo catálogo/proveedores. Semana 2: formación. Semana 3: operación real."
- **"¿Migración desde Excel?"** — "Me mandas tus escandallos, los importo. Lo que no parsee queda draft — chef revisa en 15 min."
- **"¿Coste oculto IA?"** — "No. 0.01 €/albarán con Claude. 100 albaranes = 1€. Transparente en factura."
- **"¿Si dejo de pagar?"** — "Exporto todo a CSV en 24h. Datos tuyos."

---

## 4 · Post-demo

```
[ ] Email follow-up a Iago mismo sábado o domingo AM
    - Thank you + 3 puntos clave
    - Next step concreto
    - Link vídeo si lo grabaste
[ ] Apuntar en decisions-log.md: qué funcionó / falló / objeciones no resueltas
[ ] Si SÍ: acuerdo piloto + email lunes 8:00
[ ] Si DUDA: agendar call chef antes del jueves
[ ] Si NO: "¿qué tendría que ser verdad?" → archivar
```

---

## 5 · Recordatorios

- No leas este playbook durante la demo. Es para preparar la noche antes.
- Escucha más de lo que hables. El valor está en las pausas.
- No pidas disculpas si algo falla. Arreglas y sigues.
- No menciones precios antes de que pregunten.
- Nunca digas "depende" sin un compromiso.
- Sonríe. Aunque sea por Zoom.

---

## Criterio de éxito

- Demo terminó en <45 min
- Cliente hizo al menos una pregunta sobre implementación o precio
- Se cerró un next step concreto (piloto, call chef, LOI)

---

## Relación con otros documentos

- `/.ai/specs/design-tokens.md` — la UI debe verse así
- `/.ai/checklists/release-runbook.md` — pre-release previo a la demo
- `/.ai/skills/ocr-delivery-notes-workflow/` — el flow que se demuestra en Acto IV
