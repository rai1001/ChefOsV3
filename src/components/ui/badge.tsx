'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'neutral' | 'urgent' | 'warning' | 'success' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return <span className={cn('badge-status', variant, className)} {...props} />
}
