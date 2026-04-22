'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, style, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded border px-3 py-2 text-sm transition-colors',
        'placeholder:text-[color:var(--color-text-muted)]',
        'disabled:opacity-60',
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
