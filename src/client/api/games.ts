'use client'

import {
  GameCommandResponse as GameCommandResponseSchema,
  GameListDto,
  GameViewDto,
} from '@/contracts/game-api'
import type {
  CreateGameRequest,
  GameCommand,
  GameCommandResponse,
} from '@/contracts/game-api'
import { toast } from '@/components/ui/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, jsonRequest } from './fetchApi'

const gameKey = (gameId: string) => ['game', gameId] as const
const gamesKey = ['games'] as const

export const fetchGameView = (gameId: string) =>
  fetchApi(`/api/v1/games/${encodeURIComponent(gameId)}`, GameViewDto)

export const useGameView = (gameId: string) =>
  useQuery({
    queryKey: gameKey(gameId),
    queryFn: () => fetchGameView(gameId),
  })

export const useGameCommand = (gameId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (command: GameCommand): Promise<GameCommandResponse> => {
      const current = queryClient.getQueryData<GameViewDto>(gameKey(gameId))
      if (!current) throw new Error('Game is not loaded')

      return fetchApi(
        `/api/v1/games/${encodeURIComponent(gameId)}/commands`,
        GameCommandResponseSchema,
        jsonRequest(
          { expectedRevision: current.game.revision, command },
          {
            method: 'POST',
            headers: { 'idempotency-key': crypto.randomUUID() },
          },
        ),
      )
    },
    onSuccess: ({ view, result }) => {
      queryClient.setQueryData(gameKey(gameId), view)
      if (result?.message) toast({ title: result.message })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: gameKey(gameId) })
    },
  })
}

export const invalidateGame = async ({
  gameId,
  queryClient,
}: {
  gameId: string
  queryClient: ReturnType<typeof useQueryClient>
}) => queryClient.invalidateQueries({ queryKey: gameKey(gameId) })

export const useGames = (enabled = true) =>
  useQuery({
    queryKey: gamesKey,
    enabled,
    queryFn: async () => {
      return fetchApi('/api/v1/games', GameListDto)
    },
  })

export const useCreateGame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateGameRequest) => {
      return fetchApi(
        '/api/v1/games',
        GameViewDto,
        jsonRequest(input, {
          method: 'POST',
          headers: { 'idempotency-key': crypto.randomUUID() },
        }),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gamesKey }),
  })
}

export const useDeleteGame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(
        `/api/v1/games/${encodeURIComponent(gameId)}`,
        { method: 'DELETE', credentials: 'same-origin' },
      )
      if (!response.ok) throw new Error('Could not delete game')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gamesKey }),
  })
}
