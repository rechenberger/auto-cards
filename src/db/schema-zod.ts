import { GameData } from '@/game/GameData'
import { LoadoutData } from '@/game/LoadoutData'
import { GameMode } from '@/game/gameMode'
import { createSeed } from '@/game/seed'
import { ThemeId } from '@/game/themes'
import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { schema } from './schema-export'

const seed = z.string().default(() => createSeed())

export const User = createSelectSchema(schema.users, {
  themeId: ThemeId.or(z.null()),
})
export type User = z.infer<typeof User>

export const Loadout = createSelectSchema(schema.loadout, {
  data: LoadoutData,
  gameMode: GameMode,
})
export type Loadout = z.infer<typeof Loadout>

export const Game = createSelectSchema(schema.game, {
  data: GameData,
  gameMode: GameMode,
})
export type Game = z.infer<typeof Game>

export const MatchData = z.object({
  seed,
})
export type MatchData = z.infer<typeof MatchData>

export const Match = createSelectSchema(schema.match, {
  data: MatchData,
  gameMode: GameMode,
})
export type Match = z.infer<typeof Match>

export const MatchParticipationData = z.object({})
export type MatchParticipationData = z.infer<typeof MatchParticipationData>

export const MatchParticipation = createSelectSchema(
  schema.matchParticipation,
  {
    data: MatchParticipationData,
  },
)
export type MatchParticipation = z.infer<typeof MatchParticipation>

export const LiveMatchStatus = z.enum(['open', 'locked'])
export type LiveMatchStatus = z.infer<typeof LiveMatchStatus>

export const LiveMatchData = z.object({
  seed,
})
export type LiveMatchData = z.infer<typeof LiveMatchData>

export const LiveMatch = createSelectSchema(schema.liveMatch, {
  data: LiveMatchData,
  status: LiveMatchStatus,
})
export type LiveMatch = z.infer<typeof LiveMatch>

export const LiveMatchParticipationData = z.object({
  ready: z.boolean().default(false),
  isHost: z.boolean().default(false),
})
export type LiveMatchParticipationData = z.infer<
  typeof LiveMatchParticipationData
>

export const LiveMatchParticipation = createSelectSchema(
  schema.liveMatchParticipation,
  {
    data: LiveMatchParticipationData,
  },
)
export type LiveMatchParticipation = z.infer<typeof LiveMatchParticipation>

export const LeaderboardEntry = createSelectSchema(schema.leaderboardEntry, {
  gameMode: GameMode,
})
export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>

// ==========================================
// AI Playtest Schemas
// ==========================================

/**
 * Memory entry for AI agent learning
 */
export const AiAgentMemoryEntry = z.object({
  timestamp: z.string(),
  type: z.enum(['strategy', 'lesson', 'preference', 'meta']),
  content: z.string(),
  importance: z.number().min(0).max(1).default(0.5),
})
export type AiAgentMemoryEntry = z.infer<typeof AiAgentMemoryEntry>

/**
 * AI Agent memory blob - stores learning across runs
 */
export const AiAgentMemory = z.object({
  entries: z.array(AiAgentMemoryEntry).default([]),
  // Summary of key learnings (auto-generated when memory grows)
  summary: z.string().optional(),
  // Stats
  totalRuns: z.number().default(0),
  totalWins: z.number().default(0),
  totalLosses: z.number().default(0),
})
export type AiAgentMemory = z.infer<typeof AiAgentMemory>

/**
 * Configuration for an AI playtest run
 */
export const AiPlaytestRunConfig = z.object({
  maxRounds: z.number().default(10),
  maxShopStepsPerRound: z.number().default(50),
  maxActionRetries: z.number().default(3),
  // Whether to generate reports at the end
  generateReport: z.boolean().default(true),
  generateSuggestions: z.boolean().default(true),
  // Whether to update agent memory after run
  updateMemory: z.boolean().default(true),
})
export type AiPlaytestRunConfig = z.infer<typeof AiPlaytestRunConfig>

/**
 * Observation passed to the AI for decision making
 */
export const AiPlaytestStepObservation = z.object({
  roundNo: z.number(),
  gold: z.number(),
  shopItems: z.array(
    z.object({
      index: z.number(),
      name: z.string(),
      price: z.number(),
      effectivePrice: z.number(), // After sale discount
      isOnSale: z.boolean(),
      isSold: z.boolean(),
      isReserved: z.boolean(),
      isUnique: z.boolean(),
      tags: z.array(z.string()),
      // Brief description for the AI
      description: z.string().optional(),
    }),
  ),
  currentLoadout: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        count: z.number().optional(),
      }),
    ),
    // Summary stats
    stats: z.record(z.string(), z.number()).optional(),
  }),
  // Game context
  maxRounds: z.number(),
  rerollPrice: z.number(),
  // Recent history for context
  recentActions: z.array(z.string()).optional(),
  // Win/loss record this run
  wins: z.number(),
  losses: z.number(),
})
export type AiPlaytestStepObservation = z.infer<typeof AiPlaytestStepObservation>

/**
 * Action chosen by the AI
 */
export const AiPlaytestStepAction = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('buy'),
    shopIndex: z.number(),
    reasoning: z.string().optional(),
  }),
  z.object({
    type: z.literal('reserve'),
    shopIndex: z.number(),
    reasoning: z.string().optional(),
  }),
  z.object({
    type: z.literal('unreserve'),
    shopIndex: z.number(),
    reasoning: z.string().optional(),
  }),
  z.object({
    type: z.literal('reroll'),
    reasoning: z.string().optional(),
  }),
  z.object({
    type: z.literal('endShop'),
    reasoning: z.string().optional(),
  }),
])
export type AiPlaytestStepAction = z.infer<typeof AiPlaytestStepAction>

/**
 * Result of applying an action
 */
export const AiPlaytestStepResult = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  // State changes
  goldChange: z.number().optional(),
  itemsBought: z.array(z.string()).optional(),
  // For fight results (at end of round)
  fightResult: z
    .object({
      won: z.boolean(),
      enemyLoadoutSummary: z.string().optional(),
    })
    .optional(),
})
export type AiPlaytestStepResult = z.infer<typeof AiPlaytestStepResult>

/**
 * AI Agent table schema
 */
export const AiAgent = createSelectSchema(schema.aiAgent, {
  memory: AiAgentMemory,
})
export type AiAgent = z.infer<typeof AiAgent>

/**
 * AI Playtest Run table schema
 */
export const AiPlaytestRun = createSelectSchema(schema.aiPlaytestRun, {
  config: AiPlaytestRunConfig,
})
export type AiPlaytestRun = z.infer<typeof AiPlaytestRun>

/**
 * AI Playtest Step table schema
 */
export const AiPlaytestStep = createSelectSchema(schema.aiPlaytestStep, {
  observation: AiPlaytestStepObservation,
  action: AiPlaytestStepAction,
  result: AiPlaytestStepResult,
})
export type AiPlaytestStep = z.infer<typeof AiPlaytestStep>
