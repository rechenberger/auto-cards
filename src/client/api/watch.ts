'use client'

import {
  LeaderboardDto,
  RecentGamesDto,
  RecentMatchesDto,
} from '@/contracts/watch'
import { useQuery } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

export const useRecentMatches = () =>
  useQuery({
    queryKey: ['watch', 'recent-matches'],
    queryFn: () => fetchApi('/api/v1/watch/recent-matches', RecentMatchesDto),
  })

export const useRecentGames = () =>
  useQuery({
    queryKey: ['watch', 'recent-games'],
    queryFn: () => fetchApi('/api/v1/watch/recent-games', RecentGamesDto),
  })

export const useLeaderboard = ({
  round,
  type,
}: {
  round: number
  type: string
}) =>
  useQuery({
    queryKey: ['watch', 'leaderboard', round, type],
    queryFn: () =>
      fetchApi(
        `/api/v1/watch/leaderboard?round=${round}&type=${encodeURIComponent(
          type,
        )}`,
        LeaderboardDto,
      ),
    refetchInterval: 30_000,
  })
