'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, style, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded border px-3 py-2 text-sm transition-colors',
        'placeholder:text-[color:var(--color-text-muted)] disabled:opacity-60',
        className
      )}
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-input)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
      {...props}
    />
  )
})
