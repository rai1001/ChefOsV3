import 'server-only'

/**
 * Contrato público server-only del módulo `tenant-admin`.
 *
 * Helpers que leen datos sensibles o consumen `next/headers` y NO deben filtrarse al bundle cliente.
 */

export { previewInviteServer } from './application/preview-invite.server'
export type { InvitePreview } from './infrastructure/invite-queries'
