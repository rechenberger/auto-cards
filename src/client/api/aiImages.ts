'use client'

import {
  ActivateAiImageResultDto,
  AiImageCommand,
  AiImageJobBatchDto,
  AiImagesDto,
} from '@/contracts/ai-images'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

export type AiImageQuery = {
  itemId?: string
  themeId?: string | null
  prompt?: string
  limit?: number
}

export const aiImagesKey = (query: AiImageQuery) => [
  'ai-images',
  query.itemId ?? null,
  query.themeId === undefined ? 'any-theme' : query.themeId ?? 'null-theme',
  query.prompt ?? null,
  query.limit ?? 12,
]

const queryString = (query: AiImageQuery) => {
  const params = new URLSearchParams()
  if (query.itemId) params.set('itemId', query.itemId)
  if (query.themeId !== undefined) {
    params.set('themeId', query.themeId ?? 'null')
  }
  if (query.prompt) params.set('prompt', query.prompt)
  params.set('limit', String(query.limit ?? 12))
  return params.toString()
}

export const useAiImages = (query: AiImageQuery) =>
  useQuery({
    queryKey: aiImagesKey(query),
    queryFn: () =>
      fetchApi(`/api/v1/ai-images?${queryString(query)}`, AiImagesDto),
  })

export const useGenerateAiImages = () =>
  useMutation({
    mutationFn: (command: AiImageCommand) =>
      fetchApi('/api/v1/ai-images', AiImageJobBatchDto, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify(command),
      }),
  })

export const useActivateAiImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) =>
      fetchApi(
        `/api/v1/ai-images/${encodeURIComponent(imageId)}`,
        ActivateAiImageResultDto,
        {
          method: 'PATCH',
          headers: { 'idempotency-key': crypto.randomUUID() },
        },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-images'] }),
  })
}
