# Release Runbook — ChefOS v3

> Checklist para publicar una versión de ChefOS v3 en producción.

Referencia: [`specs/ci-standards.md`](../specs/ci-standards.md), [`specs/database-security.md`](../specs/database-security.md).

---

## 1. Pre-release checks

- [ ] `npm run lint && npm run typecheck && npm run build` → 0 errores
- [ ] `npm run test` → 0 errores
- [ ] `npm run test:e2e` → 0 errores (o skip justificado si `E2E_ENABLED=false`)
- [ ] Smoke browser manual: login + dashboard + ruta tocada en el release
- [ ] Verificar migraciones SQL aplicadas: comparar `ls supabase/migrations/` vs estado en Supabase dashboard
- [ ] CHANGELOG.md actualizado con cambios de esta versión
- [ ] Version bump en `package.json` si aplica (semver)

---

## 2. Variables de entorno requeridas

### Next.js (Vercel → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server-side / API routes)
- `NEXT_PUBLIC_BYPASS_AUTH=false` (en producción **siempre false**)

### Edge Functions (Supabase Dashboard → Edge Functions → Secrets)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (para `ocr-receipt`)
- `RESEND_API_KEY` (para `notification-dispatcher`)
- `APP_BASE_URL` — URL pública de producción (prefijo de enlaces en emails)

---

## 3. Database Webhooks

(Supabase Dashboard → Database → Webhooks)

- [ ] `notifications` INSERT → `notification-dispatcher`
  - Headers: `Authorization: Bearer <SERVICE_ROLE_KEY>` (obligatorio)
  - Sin este header, la edge function rechaza con 401

---

## 4. Deploy pipeline

### 4.1 Aplicar migraciones pendientes

```bash
# Desde la raíz del repo
cat supabase/migrations/000XX_*.sql | npx supabase db query --linked
```

Verificar aplicación:

```bash
npx supabase db dump --linked --schema public | grep "version_XX"
```

### 4.2 Redeploy edge functions tocadas

```bash
npx supabase functions deploy <function-name> --linked
```

Funciones activas en ChefOS v3:

- `ocr-receipt`
- `notification-dispatcher`
- `automation-worker`

### 4.3 Deploy Next.js en Vercel

- Push a `main` → auto deploy
- O desde panel Vercel → "Redeploy" en producción

### 4.4 Verificar deploy exitoso

- [ ] Vercel build pasó sin errores
- [ ] Supabase functions reportan "ACTIVE"
- [ ] No hay errores en logs de Vercel primer minuto post-deploy

---

## 5. Smoke test post-deploy

Probar en producción:

- [ ] Login con cuenta de prueba
- [ ] Dashboard carga con KPIs
- [ ] Crear evento → generar BEO PDF (valida wrapper dynamic react-pdf)
- [ ] Crear pedido PR → aprobar → PO → GR
- [ ] Recepción actualiza inventario (FIFO)
- [ ] Escandallo live → "actualizado hace N segundos" cuenta correctamente (valida React 19 purity)
- [ ] Trigger de agente: al confirmar evento, aparece sugerencia en `/agents`
- [ ] Notificación email llega con enlace interno válido
- [ ] OCR: subir foto albarán → procesa → genera GR lines

---

## 6. Rollback

### Si hay problema funcional

**Migración SQL:**

- DROP de los objetos creados
- Recrear los anteriores desde `git show <commit>~1 supabase/migrations/000XX_*.sql`

**Edge function:**

```bash
git checkout <commit>~1 supabase/functions/<name>
npx supabase functions deploy <name> --linked
```

**Vercel:**

- Panel Vercel → Deployments → elegir deploy anterior → "Promote to Production"

### Si hay leak de secretos

- [ ] Rotar credenciales de integraciones PMS/POS en consolas externas
- [ ] `update_pms_integration` / `update_pos_integration` con nuevos tokens
- [ ] Revisar `integration_sync_logs` buscando `sync_type` fuera de whitelist (migración 00029)
- [ ] Registrar incidente en `decisions-log.md`

---

## 7. Post-release

### Comunicación

- [ ] Anuncio interno al equipo con resumen de cambios
- [ ] Si hay clientes activos y cambios visibles: email / canal de comunicación
- [ ] Actualizar `docs/release-notes.md` (si existe)

### Monitoreo (primeras 24h)

- [ ] Logs de Vercel: sin errores 5xx inusuales
- [ ] Logs de Supabase: sin RLS errors inesperados
- [ ] Rate limits: chequear que no hay 429 frecuentes en producción
- [ ] Usuarios pilotos: feedback

### Post-mortem si hubo incidente

- Entrada en `decisions-log.md` con:
  - Qué pasó
  - Impacto
  - Root cause
  - Plan de prevención

---

## 8. Acceso al release

- **URL producción**: configurada en Vercel (ej. `https://chefos-v3.vercel.app` o dominio propio)
- **Panel Supabase**: [https://supabase.com/dashboard/project/<project-id>]
- **Panel Vercel**: [https://vercel.com/<team>/chefos-v3]

---

## Relación con otros documentos

- `/.ai/specs/ci-standards.md` (checks obligatorios)
- `/.ai/specs/database-security.md` (gestión de secrets, rotación)
- `/.ai/prompts/ci-workflow-setup.prompt.md` (setup GitHub Actions)
- `/.ai/skills/demo-chefos-playbook/` (pre-release si hay demo agendada)
