'use client'

import {
  CollectorCommand,
  CollectorCommandResponse as CollectorCommandResponseSchema,
} from '@/contracts/collector-api'
import type { CollectorCommandResponse } from '@/contracts/collector-api'
import { GameViewDto } from '@/contracts/game-api'
import { toast } from '@/components/ui/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

const gameKey = (gameId: string) => ['game', gameId] as const

export const useCollectorCommand = (gameId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      command: CollectorCommand,
    ): Promise<CollectorCommandResponse> => {
      const current = queryClient.getQueryData<GameViewDto>(gameKey(gameId))
      if (!current) throw new Error('Game is not loaded')

      return fetchApi(
        `/api/v1/games/${encodeURIComponent(gameId)}/collector/commands`,
        CollectorCommandResponseSchema,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
          },
          body: JSON.stringify({
            expectedRevision: current.game.revision,
            rulesetVersion: current.game.version,
            command,
          }),
        },
      )
    },
    onSuccess: ({ view, result }) => {
      queryClient.setQueryData(gameKey(gameId), view)
      if (result.message) toast({ title: result.message })
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: gameKey(gameId) })
      toast({
        variant: 'destructive',
        title: 'Collector command failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    },
  })
}
