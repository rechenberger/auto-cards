import { ItemData } from '@/game/ItemData'
import { z } from 'zod'
import { LeaderboardSummaryDto } from './watch'

export const LiveMatchStatusDto = z.enum(['open', 'locked'])
export type LiveMatchStatusDto = z.infer<typeof LiveMatchStatusDto>

export const LiveMatchParticipantDto = z.object({
  id: z.string(),
  displayName: z.string(),
  isHost: z.boolean(),
  ready: z.boolean(),
  hasGame: z.boolean(),
  isCurrentUser: z.boolean(),
})
export type LiveMatchParticipantDto = z.infer<typeof LiveMatchParticipantDto>

export const LiveMatchMeDto = z.object({
  participationId: z.string(),
  isHost: z.boolean(),
  ready: z.boolean(),
  gameId: z.string().nullable(),
})
export type LiveMatchMeDto = z.infer<typeof LiveMatchMeDto>

export const LiveMatchViewDto = z.object({
  id: z.string(),
  status: LiveMatchStatusDto,
  rulesetVersion: z.number().int().positive(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  participants: z.array(LiveMatchParticipantDto),
  me: LiveMatchMeDto.nullable(),
  allReady: z.boolean(),
  canStartMatches: z.boolean(),
})
export type LiveMatchViewDto = z.infer<typeof LiveMatchViewDto>

export const CreateLiveMatchRequest = z.object({}).strict()
export type CreateLiveMatchRequest = z.infer<typeof CreateLiveMatchRequest>

export const LiveMatchCommand = z.discriminatedUnion('type', [
  z.object({ type: z.literal('join') }),
  z.object({ type: z.literal('start-game') }),
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('start-matches') }),
])
export type LiveMatchCommand = z.infer<typeof LiveMatchCommand>

export const LiveMatchCommandResponse = z.object({
  view: LiveMatchViewDto,
  message: z.string().optional(),
  redirectTo: z.string().optional(),
})
export type LiveMatchCommandResponse = z.infer<typeof LiveMatchCommandResponse>

export const LiveMatchRoundResultDto = z.object({
  roundNo: z.number().int().nonnegative(),
  status: z.enum(['won', 'lost']).nullable(),
  matchId: z.string().nullable(),
  points: z.number().int().nonnegative(),
})
export type LiveMatchRoundResultDto = z.infer<typeof LiveMatchRoundResultDto>

export const LiveMatchResultEntryDto = z.object({
  participationId: z.string(),
  displayName: z.string(),
  gameId: z.string(),
  rank: z.number().int().positive(),
  score: z.number().int().nonnegative(),
  currentRoundNo: z.number().int().nonnegative(),
  rounds: z.array(LiveMatchRoundResultDto),
  latestLoadout: z
    .object({
      id: z.string(),
      roundNo: z.number().int().nonnegative(),
      items: z.array(ItemData),
    })
    .nullable(),
  leaderboard: LeaderboardSummaryDto.nullable(),
})
export type LiveMatchResultEntryDto = z.infer<typeof LiveMatchResultEntryDto>

export const LiveMatchResultsDto = z.object({
  liveMatchId: z.string(),
  rulesetVersion: z.number().int().positive(),
  entries: z.array(LiveMatchResultEntryDto),
})
export type LiveMatchResultsDto = z.infer<typeof LiveMatchResultsDto>

export const LiveMatchListItemDto = z.object({
  id: z.string(),
  status: LiveMatchStatusDto,
  rulesetVersion: z.number().int().positive(),
  createdAt: z.string().nullable(),
  participantCount: z.number().int().nonnegative(),
})
export type LiveMatchListItemDto = z.infer<typeof LiveMatchListItemDto>

export const LiveMatchListDto = z.object({
  matches: z.array(LiveMatchListItemDto),
})
export type LiveMatchListDto = z.infer<typeof LiveMatchListDto>
