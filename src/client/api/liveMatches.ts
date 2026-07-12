'use client'

import { toast } from '@/components/ui/use-toast'
import {
  LiveMatchCommandResponse,
  LiveMatchListDto,
  LiveMatchResultsDto,
  LiveMatchViewDto,
} from '@/contracts/live-api'
import type { LiveMatchCommand } from '@/contracts/live-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

export const liveMatchKey = (liveMatchId: string) =>
  ['live-match', liveMatchId] as const
export const liveMatchResultsKey = (liveMatchId: string) =>
  ['live-match-results', liveMatchId] as const
export const liveMatchListKey = ['live-matches'] as const

const jsonRequest = ({
  body,
  idempotencyKey,
}: {
  body: unknown
  idempotencyKey: string
}): RequestInit => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'idempotency-key': idempotencyKey,
  },
  body: JSON.stringify(body),
})

export const useLiveMatch = (liveMatchId?: string | null) =>
  useQuery({
    queryKey: liveMatchKey(liveMatchId ?? 'none'),
    enabled: Boolean(liveMatchId),
    queryFn: () => {
      if (!liveMatchId) throw new Error('Live match id is required')
      return fetchApi(
        `/api/v1/live-matches/${encodeURIComponent(liveMatchId)}`,
        LiveMatchViewDto,
      )
    },
    refetchInterval: (query) =>
      query.state.data?.me?.ready || query.state.data?.allReady ? 1_000 : 5_000,
    refetchIntervalInBackground: false,
  })

export const useLatestLiveMatches = () =>
  useQuery({
    queryKey: liveMatchListKey,
    queryFn: () => fetchApi('/api/v1/live-matches', LiveMatchListDto),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  })

export const useLiveMatchResults = (
  liveMatchId: string,
  { poll = false }: { poll?: boolean } = {},
) =>
  useQuery({
    queryKey: liveMatchResultsKey(liveMatchId),
    queryFn: () =>
      fetchApi(
        `/api/v1/live-matches/${encodeURIComponent(liveMatchId)}/results`,
        LiveMatchResultsDto,
      ),
    staleTime: 5_000,
    refetchInterval: poll ? 5_000 : false,
    refetchIntervalInBackground: false,
  })

export const useCreateLiveMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options?: { idempotencyKey?: string }) =>
      fetchApi(
        '/api/v1/live-matches',
        LiveMatchViewDto,
        jsonRequest({
          body: {},
          idempotencyKey: options?.idempotencyKey ?? crypto.randomUUID(),
        }),
      ),
    onSuccess: (view) => {
      queryClient.setQueryData(liveMatchKey(view.id), view)
      void queryClient.invalidateQueries({ queryKey: liveMatchListKey })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Could not create live match',
        description: error instanceof Error ? error.message : undefined,
      })
    },
  })
}

export const useLiveMatchCommand = (liveMatchId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      command,
      idempotencyKey = crypto.randomUUID(),
    }: {
      command: LiveMatchCommand
      idempotencyKey?: string
    }) =>
      fetchApi(
        `/api/v1/live-matches/${encodeURIComponent(liveMatchId)}/commands`,
        LiveMatchCommandResponse,
        jsonRequest({ body: command, idempotencyKey }),
      ),
    onSuccess: (response) => {
      queryClient.setQueryData(liveMatchKey(liveMatchId), response.view)
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: liveMatchResultsKey(liveMatchId),
        }),
        queryClient.invalidateQueries({ queryKey: liveMatchListKey }),
        queryClient.invalidateQueries({ queryKey: ['game'] }),
        queryClient.invalidateQueries({ queryKey: ['games'] }),
      ])
      if (response.message) toast({ title: response.message })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Live match action failed',
        description: error instanceof Error ? error.message : undefined,
      })
    },
  })
}
