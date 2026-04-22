'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createInviteAction, type CreateInviteActionResult } from './create-invite-action'
import type { CreateInviteInput } from '../domain/types'

export function useCreateInvite(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateInviteInput): Promise<CreateInviteActionResult> => {
      return createInviteAction(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'invites', hotelId] })
    },
  })
}
