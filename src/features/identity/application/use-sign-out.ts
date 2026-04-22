'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
      router.refresh()
    },
  })
}
