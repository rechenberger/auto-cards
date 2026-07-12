'use client'

import { CatalogResponse } from '@/contracts/catalog'
import { MetaResponse } from '@/contracts/meta'
import { ThemeId } from '@/game/themeSchema'
import { useQuery } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

export const useMeta = () =>
  useQuery({
    queryKey: ['meta'],
    queryFn: () => fetchApi('/api/v1/meta', MetaResponse),
    staleTime: 60_000,
  })

export const useCatalog = (themeId?: ThemeId) =>
  useQuery({
    queryKey: ['catalog', themeId ?? 'default'],
    queryFn: () =>
      fetchApi(
        `/api/v1/catalog${
          themeId ? `?themeId=${encodeURIComponent(themeId)}` : ''
        }`,
        CatalogResponse,
      ),
    staleTime: 5 * 60_000,
  })
