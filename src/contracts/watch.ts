import { LoadoutData } from '@/game/LoadoutData'
import { DungeonAccess } from '@/game/dungeons/DungeonAccess'
import { GameMode } from '@/game/gameMode'
import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const LeaderboardSummaryDto = z.object({
  rank: z.number().int().positive(),
  score: z.number(),
  isTop: z.boolean(),
})
export type LeaderboardSummaryDto = z.infer<typeof LeaderboardSummaryDto>

export const PublicParticipantDto = z.object({
  sideIdx: z.number().int(),
  status: z.enum(['won', 'lost']),
  displayName: z.string(),
  themeId: ThemeId,
  loadout: LoadoutData,
})

export const RecentMatchDto = z.object({
  id: z.string(),
  createdAt: z.string().nullable(),
  roundNo: z.number().int().nonnegative(),
  participants: z.array(PublicParticipantDto).length(2),
})

export const RecentMatchesDto = z.object({
  matches: z.array(RecentMatchDto),
})

export const PublicRoundDto = z.object({
  roundNo: z.number().int().nonnegative(),
  status: z.enum(['won', 'lost']).nullable(),
  matchId: z.string().nullable(),
})

export const RecentGameDto = z.object({
  id: z.string(),
  displayName: z.string(),
  updatedAt: z.string().nullable(),
  version: z.number().int(),
  gameMode: GameMode,
  dungeonAccesses: z.array(DungeonAccess).optional(),
  rounds: z.array(PublicRoundDto),
  leaderboard: LeaderboardSummaryDto.nullable(),
})

export const RecentGamesDto = z.object({ games: z.array(RecentGameDto) })

export const PublicLeaderboardEntryDto = z.object({
  id: z.string(),
  rank: z.number().int().positive(),
  score: z.number(),
  roundNo: z.number().int().nonnegative(),
  type: z.string(),
  loadoutId: z.string(),
  gameId: z.string().nullable(),
  displayName: z.string(),
  themeId: ThemeId,
  createdAt: z.string().nullable(),
  loadout: LoadoutData,
})

export const LeaderboardDto = z.object({
  entries: z.array(PublicLeaderboardEntryDto),
  roundNo: z.number().int().nonnegative(),
  type: z.string(),
  isAdmin: z.boolean(),
})

export type RecentMatchesDto = z.infer<typeof RecentMatchesDto>
export type RecentGamesDto = z.infer<typeof RecentGamesDto>
export type LeaderboardDto = z.infer<typeof LeaderboardDto>
