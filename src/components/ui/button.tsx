'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-[color:var(--accent-fg)] hover:bg-[color:var(--color-accent-hover)]',
  secondary: 'border text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-hover)]',
  ghost: 'text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-hover)]',
  danger: 'text-[color:var(--color-danger-fg)] border hover:bg-[color:var(--urgent-bg)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

const borderStyle = {
  borderColor: 'var(--color-border)',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', asChild = false, type, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  const needsBorder = variant === 'secondary' || variant === 'danger'

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(base, variants[variant], sizes[size], className)}
      style={needsBorder ? { ...borderStyle, ...style } : style}
      {...props}
    />
  )
})
