/**
 * Valida que los arrays de roles en migraciones cubiertas estén alineados
 * con `.ai/specs/permissions-matrix.md` (hallazgo C1 hardening-2 + parser
 * solicitado por hardening-2b, extendido en sprint-11 warehouse).
 *
 * Ejecuta:
 *   npm run validate:permissions
 *
 * Falla con exit code 1 si:
 *   - Una RPC cubierta permite un rol que la matriz marca ❌
 *   - O usa `null` en lugar de whitelist para una acción que la matriz restringe
 *
 * Solo cubre RPCs mapeadas explícitamente. Para extender a otros módulos, añadir
 * entradas a `RPC_ACTION_MAP`.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface MatrixEntry {
  action: string
  // Map rol -> allowed (true if ✅ or ⚠️, false if ❌)
  roles: Record<string, boolean>
}

const ROLE_ORDER = [
  'superadmin',
  'direction',
  'admin',
  'head_chef',
  'sous_chef',
  'cook',
  'commercial',
  'procurement',
  'warehouse',
] as const

// Mapa: nombre RPC -> entrada de matriz que la cubre.
const RPC_ACTION_MAP: Record<string, string> = {
  v3_record_goods_receipt_quality_check: 'Registrar APPCC',
  v3_log_equipment_temperature: 'Log temperaturas',
  v3_complete_cleaning_check: 'Registrar APPCC',
  v3_trace_lot: 'Trace lot (auditoría)',
  v3_get_stock_by_warehouse: 'Ver stock por almacén',
  v3_create_warehouse: 'Crear almacén',
  v3_update_warehouse: 'Editar almacén',
  v3_set_default_warehouse: 'Definir almacén default',
  v3_archive_warehouse: 'Archivar almacén',
  v3_transfer_lot_quantity: 'Transferir stock entre almacenes',
}

function parseMatrix(matrixMarkdown: string): MatrixEntry[] {
  const lines = matrixMarkdown.split('\n')
  const entries: MatrixEntry[] = []

  for (const line of lines) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').map((c) => c.trim())
    // | Acción | superadmin | direction | admin | head_chef | sous_chef | cook | commercial | procurement | warehouse |
    if (cells.length < 11) continue
    const action = cells[1]
    if (!action || action === 'Acción' || action.startsWith('---')) continue

    const roles: Record<string, boolean> = {}
    ROLE_ORDER.forEach((role, i) => {
      const cell = cells[2 + i]
      // ✅ y ⚠️ = permitido. ❌ = denegado.
      roles[role] = cell !== '❌' && cell !== ''
    })
    entries.push({ action, roles })
  }
  return entries
}

interface RpcArrayUsage {
  rpcName: string
  rolesArray: string[] | 'null'
  sourceMigration: string
  line: number
}

function parseRpcRoleArrays(sql: string, migrationName: string): RpcArrayUsage[] {
  const usages: RpcArrayUsage[] = []
  // Regex para `create or replace function public.<name>(`
  const fnRegex = /create or replace function public\.(v3_\w+)\s*\(/gi
  // Regex para v3_check_membership(auth.uid(), p_hotel_id, ARG):
  //   ARG es `null` o `array['rol1','rol2',...]::public.v3_app_role[]`
  // Tolerante a saltos de línea entre args.
  const memberRegex = /perform\s+public\.v3_check_membership\s*\(\s*auth\.uid\(\)\s*,\s*p_hotel_id\s*,\s*(null|array\[([^\]]+)\])/gis

  // Recorremos por bloques de función
  const matches = [...sql.matchAll(fnRegex)]
  for (let i = 0; i < matches.length; i++) {
    const fnMatch = matches[i]
    if (!fnMatch) continue
    const rpcName = fnMatch[1]
    if (!rpcName) continue
    const start = fnMatch.index ?? 0
    const next = matches[i + 1]
    const end = next ? next.index ?? sql.length : sql.length
    const fnBody = sql.slice(start, end)

    const memberMatches = [...fnBody.matchAll(memberRegex)]
    for (const m of memberMatches) {
      const lineCount = sql.slice(0, start + (m.index ?? 0)).split('\n').length
      if (m[1] === 'null') {
        usages.push({
          rpcName,
          rolesArray: 'null',
          sourceMigration: migrationName,
          line: lineCount,
        })
      } else if (m[2]) {
        const roles = m[2]
          .split(',')
          .map((r) => r.replace(/['\s]/g, ''))
          .filter(Boolean)
        usages.push({
          rpcName,
          rolesArray: roles,
          sourceMigration: migrationName,
          line: lineCount,
        })
      }
    }
  }
  return usages
}

interface Violation {
  rpcName: string
  action: string
  detail: string
  sourceMigration: string
  line: number
}

function findViolations(
  usages: RpcArrayUsage[],
  matrix: MatrixEntry[]
): Violation[] {
  const violations: Violation[] = []
  const matrixByAction = new Map(matrix.map((e) => [e.action, e]))

  for (const usage of usages) {
    const action = RPC_ACTION_MAP[usage.rpcName]
    if (!action) continue

    const entry = matrixByAction.get(action)
    if (!entry) {
      violations.push({
        rpcName: usage.rpcName,
        action,
        detail: `Acción "${action}" no encontrada en permissions-matrix.md`,
        sourceMigration: usage.sourceMigration,
        line: usage.line,
      })
      continue
    }

    if (usage.rolesArray === 'null') {
      // null = cualquier miembro. Solo válido si todos los roles están en ✅ o ⚠️.
      const deniedRoles = ROLE_ORDER.filter((r) => entry.roles[r] === false)
      if (deniedRoles.length > 0) {
        violations.push({
          rpcName: usage.rpcName,
          action,
          detail: `Usa v3_check_membership(..., null) (cualquier miembro) pero la matriz NIEGA: ${deniedRoles.join(', ')}`,
          sourceMigration: usage.sourceMigration,
          line: usage.line,
        })
      }
      continue
    }

    // Verificar que cada rol del array esté permitido en la matriz.
    const wronglyAllowed = usage.rolesArray.filter((r) => entry.roles[r] === false)
    if (wronglyAllowed.length > 0) {
      violations.push({
        rpcName: usage.rpcName,
        action,
        detail: `Permite roles que la matriz NIEGA: ${wronglyAllowed.join(', ')} (array: [${usage.rolesArray.join(', ')}])`,
        sourceMigration: usage.sourceMigration,
        line: usage.line,
      })
    }
  }
  return violations
}

function main() {
  const root = process.cwd()
  const matrixPath = join(root, '.ai/specs/permissions-matrix.md')
  const matrix = parseMatrix(readFileSync(matrixPath, 'utf8'))

  // Migraciones cubiertas a verificar (orden cronológico: la última gana).
  const migrationFiles = [
    'supabase/migrations/00082_v3_compliance_appcc.sql',
    'supabase/migrations/00084_v3_compliance_permissions_fix.sql',
    'supabase/migrations/00087_v3_warehouses.sql',
  ]

  // Acumulamos por RPC: la última usage observada gana (mismo orden que aplicaría
  // Postgres con CREATE OR REPLACE FUNCTION).
  const lastUsageByRpc = new Map<string, RpcArrayUsage>()
  for (const file of migrationFiles) {
    const sql = readFileSync(join(root, file), 'utf8')
    const usages = parseRpcRoleArrays(sql, file)
    for (const usage of usages) {
      lastUsageByRpc.set(usage.rpcName, usage)
    }
  }

  const violations = findViolations(
    [...lastUsageByRpc.values()],
    matrix
  )

  if (violations.length === 0) {
    console.log('✅ permissions-matrix.md alineado con migraciones cubiertas')
    console.log(`   ${lastUsageByRpc.size} RPCs verificadas`)
    process.exit(0)
  }

  console.error(`❌ ${violations.length} violación(es) detectadas:\n`)
  for (const v of violations) {
    console.error(`  - ${v.rpcName} (${v.sourceMigration}:${v.line})`)
    console.error(`    Acción: "${v.action}"`)
    console.error(`    ${v.detail}\n`)
  }
  process.exit(1)
}

main()
