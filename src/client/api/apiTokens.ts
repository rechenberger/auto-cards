'use client'

import {
  ApiTokenListDto,
  CreateApiTokenRequest,
  CreatedApiTokenDto,
  RevokeApiTokenDto,
} from '@/contracts/api-token'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

export const apiTokensQueryKey = ['me', 'api-tokens'] as const

export const useApiTokens = () =>
  useQuery({
    queryKey: apiTokensQueryKey,
    queryFn: () => fetchApi('/api/v1/me/tokens', ApiTokenListDto),
  })

export const useCreateApiToken = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApiTokenRequest) =>
      fetchApi('/api/v1/me/tokens', CreatedApiTokenDto, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: apiTokensQueryKey })
    },
  })
}

export const useRevokeApiToken = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tokenId: string) =>
      fetchApi(
        `/api/v1/me/tokens/${encodeURIComponent(tokenId)}`,
        RevokeApiTokenDto,
        { method: 'DELETE' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: apiTokensQueryKey })
    },
  })
}
