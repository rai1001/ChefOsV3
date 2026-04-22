import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchMenu } from '../infrastructure/menu-queries'
import { fetchMenuSections } from '../infrastructure/section-queries'
import type { Menu, MenuSection } from '../domain/types'

export async function getMenuServer(hotelId: string, menuId: string): Promise<Menu> {
  const supabase = await createClient()
  return fetchMenu(supabase, hotelId, menuId)
}

export async function getMenuWithSectionsServer(
  hotelId: string,
  menuId: string
): Promise<{ menu: Menu; sections: MenuSection[] }> {
  const supabase = await createClient()
  const [menu, sections] = await Promise.all([
    fetchMenu(supabase, hotelId, menuId),
    fetchMenuSections(supabase, hotelId, menuId),
  ])
  return { menu, sections }
}
