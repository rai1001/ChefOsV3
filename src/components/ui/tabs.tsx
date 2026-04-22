'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn('inline-flex items-center gap-1 rounded border p-1 text-sm', className)}
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-sidebar)',
      }}
      {...props}
    />
  )
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded px-3 py-1.5 text-sm transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'data-[state=active]:bg-[color:var(--color-bg-card)] data-[state=active]:text-[color:var(--color-text-primary)]',
        'data-[state=inactive]:text-[color:var(--color-text-muted)]',
        'hover:text-[color:var(--color-text-primary)]',
        className
      )}
      {...props}
    />
  )
})

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
})
