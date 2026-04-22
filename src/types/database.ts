// Tipos autogenerados desde el schema Supabase (proyecto dbtrgnyfmzqsrcoadcrs).
//
// IMPORTANTE: Este archivo se regenera con `npm run db:types`.
// NO editar a mano. ADR-0012 (sprint-hardening).
//
// Si el archivo está vacío (solo este header), ejecutar:
//   npm run db:types
// Requisitos:
//   - Supabase CLI accesible (`npx supabase`).
//   - Acceso al proyecto dbtrgnyfmzqsrcoadcrs (login con `npx supabase login`).
//
// Convención de uso:
//   import type { Database, Tables, Enums } from '@/types/database'
//   type EventRow = Tables<'events'>
//   type EventStatus = Enums<'event_status'>
//
// Los tipos de DOMINIO (Event, EventStatus narrativo, etc.) viven en
// src/features/X/domain/types.ts y pueden EXTENDER estos tipos generados:
//   import type { Tables } from '@/types/database'
//   export type Event = Tables<'events'> & { computedField: string }

// Stub mínimo hasta que se ejecute `npm run db:types` por primera vez en este checkout.
// La definición real será reemplazada por la generación de Supabase CLI.
export interface Database {
  public: {
    Tables: Record<string, { Row: unknown; Insert: unknown; Update: unknown }>
    Views: Record<string, { Row: unknown }>
    Functions: Record<string, { Args: unknown; Returns: unknown }>
    Enums: Record<string, string>
    CompositeTypes: Record<string, unknown>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
