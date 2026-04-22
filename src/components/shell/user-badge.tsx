import type { Role } from '@/features/identity'
import { uxProfileFromRole } from '@/features/identity'

interface UserBadgeProps {
  fullName?: string | null
  email: string
  role: Role
}

export function UserBadge({ fullName, email, role }: UserBadgeProps) {
  const profile = uxProfileFromRole(role)
  const display = fullName?.trim() || email
  const initials = getInitials(display)

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
        style={{
          background: 'var(--color-bg-hover)',
          color: 'var(--color-text-primary)',
        }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{display}</span>
        <span className="kpi-label">
          {role} · {profile}
        </span>
      </div>
    </div>
  )
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}
