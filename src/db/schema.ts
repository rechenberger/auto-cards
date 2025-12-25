import { GameData } from '@/game/GameData'
import { LoadoutData } from '@/game/LoadoutData'
import { GAME_VERSION } from '@/game/config'
import { DefaultGameMode, GameMode } from '@/game/gameMode'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './schema-auth'
import {
  LiveMatchData,
  LiveMatchParticipationData,
  LiveMatchStatus,
  MatchData,
} from './schema-zod'

export * from './schema-auth'

const baseStats = () => ({
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: text('createdAt').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').$onUpdate(() => new Date().toISOString()),
})

const version = int('version').notNull().default(GAME_VERSION)
const gameMode = text('gameMode')
  .$type<GameMode>()
  .notNull()
  .default(DefaultGameMode)

export const game = sqliteTable(
  'game',
  {
    ...baseStats(),
    userId: text('userId').notNull(),
    data: text('data', { mode: 'json' }).$type<GameData>().notNull(),
    liveMatchId: text('liveMatchId'),
    version,
    gameMode,
  },
  (table) => ({
    gameLiveMatchIdIdx: index('gameLiveMatchIdIdx').on(table.liveMatchId),
    gameUserIdIdx: index('gameUserIdIdx').on(table.userId),
    gameCreatedAtIdx: index('gameCreatedAtIdx').on(table.createdAt),
  }),
)

export const gameRelations = relations(game, ({ one, many }) => ({
  user: one(users, {
    fields: [game.userId],
    references: [users.id],
  }),
  loadouts: many(loadout),
  matches: many(match),
  liveMatch: one(liveMatch, {
    fields: [game.liveMatchId],
    references: [liveMatch.id],
  }),
}))

export const loadout = sqliteTable(
  'loadout',
  {
    ...baseStats(),
    userId: text('userId'),
    data: text('data', { mode: 'json' }).$type<LoadoutData>().notNull(),
    gameId: text('gameId'),
    roundNo: int('roundNo').notNull(),
    primaryMatchParticipationId: text('primaryMatchParticipationId'),
    version,
    gameMode,
  },
  (table) => ({
    loadoutPrimaryMatchParticipationIdIdx: index(
      'loadoutPrimaryMatchParticipationIdIdx',
    ).on(table.primaryMatchParticipationId),
    loadoutGameIdIdx: index('loadoutGameIdIdx').on(table.gameId),
    loadoutRoundNoUserIdVersionCreatedAtIdx: index(
      'loadoutRoundNoUserIdVersionCreatedAtIdx',
    ).on(table.roundNo, table.userId, table.version, table.createdAt),
    loadoutGameIdRoundNoIdx: index('loadoutGameIdRoundNoIdx').on(
      table.gameId,
      table.roundNo,
    ),
  }),
)

export const loadoutRelations = relations(loadout, ({ one, many }) => ({
  user: one(users, {
    fields: [loadout.userId],
    references: [users.id],
  }),
  game: one(game, {
    fields: [loadout.gameId],
    references: [game.id],
  }),
  matchParticipations: many(matchParticipation),
  primaryMatchParticipation: one(matchParticipation, {
    fields: [loadout.primaryMatchParticipationId],
    references: [matchParticipation.id],
  }),
}))

export const match = sqliteTable('match', {
  ...baseStats(),
  data: text('data', { mode: 'json' }).$type<MatchData>().notNull(),
  liveMatchId: text('liveMatchId'),
  gameMode,
})

export const matchRelations = relations(match, ({ one, many }) => ({
  game: one(game, {
    fields: [match.id],
    references: [game.id],
  }),
  liveMatch: one(liveMatch, {
    fields: [match.liveMatchId],
    references: [liveMatch.id],
  }),
  matchParticipations: many(matchParticipation),
}))

export const matchParticipation = sqliteTable(
  'matchParticipation',
  {
    ...baseStats(),
    data: text('data', { mode: 'json' }).$type<object>().notNull(),
    matchId: text('matchId').notNull(),
    userId: text('userId'),
    loadoutId: text('loadoutId').notNull(),
    sideIdx: int('sideIdx').notNull(),
    status: text('stats').$type<'won' | 'lost'>().notNull(),
  },
  (table) => ({
    matchParticipationLoadoutIdIdx: index('matchParticipationLoadoutIdIdx').on(
      table.loadoutId,
    ),
    matchParticipationMatchIdIdx: index('matchParticipationMatchIdIdx').on(
      table.matchId,
    ),
    matchParticipationUserIdIdx: index('matchParticipationUserIdIdx').on(
      table.userId,
    ),
  }),
)

export const matchParticipationRelations = relations(
  matchParticipation,
  ({ one, many }) => ({
    match: one(match, {
      fields: [matchParticipation.matchId],
      references: [match.id],
    }),
    user: one(users, {
      fields: [matchParticipation.userId],
      references: [users.id],
    }),
    loadout: one(loadout, {
      fields: [matchParticipation.loadoutId],
      references: [loadout.id],
    }),
  }),
)

export const aiImage = sqliteTable(
  'aiImage',
  {
    ...baseStats(),
    prompt: text('prompt').notNull(),
    url: text('url').notNull(),
    itemId: text('itemId'),
    themeId: text('themeId'),
  },
  (table) => ({
    aiImageItemIdThemeIdUpdatedAtIdx: index(
      'aiImageItemIdThemeIdUpdatedAtIdx',
    ).on(table.itemId, table.themeId, table.updatedAt),
  }),
)

export const liveMatch = sqliteTable('liveMatch', {
  ...baseStats(),
  data: text('data', { mode: 'json' }).$type<LiveMatchData>().notNull(),
  status: text('status').$type<LiveMatchStatus>().notNull(),
})

export const liveMatchRelations = relations(liveMatch, ({ one, many }) => ({
  liveMatchParticipations: many(liveMatchParticipation),
  matches: many(match),
  games: many(game),
}))

export const liveMatchParticipation = sqliteTable(
  'liveMatchParticipation',
  {
    ...baseStats(),
    liveMatchId: text('liveMatchId').notNull(),
    userId: text('userId').notNull(),
    data: text('data', { mode: 'json' })
      .$type<LiveMatchParticipationData>()
      .notNull(),
  },
  (table) => ({
    liveMatchParticipationUserIdIdx: index(
      'liveMatchParticipationUserIdIdx',
    ).on(table.userId),
    liveMatchParticipationLiveMatchIdIdx: index(
      'liveMatchParticipationLiveMatchIdIdx',
    ).on(table.liveMatchId),
  }),
)

export const liveMatchParticipationRelations = relations(
  liveMatchParticipation,
  ({ one }) => ({
    liveMatch: one(liveMatch, {
      fields: [liveMatchParticipation.liveMatchId],
      references: [liveMatch.id],
    }),
    user: one(users, {
      fields: [liveMatchParticipation.userId],
      references: [users.id],
    }),
  }),
)

export const leaderboardEntry = sqliteTable(
  'leaderboardEntry',
  {
    ...baseStats(),
    userId: text('userId').notNull(),
    roundNo: int('roundNo').notNull(),
    loadoutId: text('loadoutId').notNull(),

    type: text('type').notNull(),
    score: int('score').notNull(),
    version,
    gameId: text('gameId'),
    gameMode,
  },
  (table) => ({
    leaderboardUserIdIdx: index('leaderboardUserIdIdx').on(table.userId),
    leaderboardTypeRoundNoVersionScoreIdx: index(
      'leaderboardTypeRoundNoVersionScoreIdx',
    ).on(table.type, table.roundNo, table.version, table.score),
    leaderboardTypeRoundNoVersionGameIdIdx: index(
      'leaderboardTypeVersionGameIdIdx',
    ).on(table.type, table.version, table.gameId),
  }),
)

export const leaderboardEntryRelations = relations(
  leaderboardEntry,
  ({ one }) => ({
    user: one(users, {
      fields: [leaderboardEntry.userId],
      references: [users.id],
    }),
    loadout: one(loadout, {
      fields: [leaderboardEntry.loadoutId],
      references: [loadout.id],
    }),
  }),
)

// ==========================================
// AI Playtest Tables
// ==========================================

import type {
  AiAgentMemory,
  AiPlaytestRunConfig,
  AiPlaytestStepAction,
  AiPlaytestStepObservation,
  AiPlaytestStepResult,
} from './schema-zod'

/**
 * AI Agent - persistent identity with memory
 */
export const aiAgent = sqliteTable(
  'aiAgent',
  {
    ...baseStats(),
    name: text('name').notNull(),
    memory: text('memory', { mode: 'json' }).$type<AiAgentMemory>().notNull(),
  },
  (table) => ({
    aiAgentNameIdx: index('aiAgentNameIdx').on(table.name),
  }),
)

export const aiAgentRelations = relations(aiAgent, ({ many }) => ({
  runs: many(aiPlaytestRun),
}))

/**
 * AI Playtest Run - one complete run instance
 */
export const aiPlaytestRun = sqliteTable(
  'aiPlaytestRun',
  {
    ...baseStats(),
    aiAgentId: text('aiAgentId').notNull(),
    config: text('config', { mode: 'json' })
      .$type<AiPlaytestRunConfig>()
      .notNull(),
    model: text('model').notNull(),
    seed: text('seed').notNull(),
    status: text('status')
      .$type<'running' | 'completed' | 'failed'>()
      .notNull()
      .default('running'),
    // Results
    wins: int('wins').notNull().default(0),
    losses: int('losses').notNull().default(0),
    finalRound: int('finalRound'),
    // Reports (markdown)
    summaryMarkdown: text('summaryMarkdown'),
    suggestionsMarkdown: text('suggestionsMarkdown'),
    // Error tracking
    errorMessage: text('errorMessage'),
  },
  (table) => ({
    aiPlaytestRunAgentIdIdx: index('aiPlaytestRunAgentIdIdx').on(
      table.aiAgentId,
    ),
    aiPlaytestRunStatusIdx: index('aiPlaytestRunStatusIdx').on(table.status),
    aiPlaytestRunCreatedAtIdx: index('aiPlaytestRunCreatedAtIdx').on(
      table.createdAt,
    ),
  }),
)

export const aiPlaytestRunRelations = relations(
  aiPlaytestRun,
  ({ one, many }) => ({
    agent: one(aiAgent, {
      fields: [aiPlaytestRun.aiAgentId],
      references: [aiAgent.id],
    }),
    steps: many(aiPlaytestStep),
  }),
)

/**
 * AI Playtest Step - individual action trace for debugging
 */
export const aiPlaytestStep = sqliteTable(
  'aiPlaytestStep',
  {
    ...baseStats(),
    runId: text('runId').notNull(),
    roundNo: int('roundNo').notNull(),
    stepNo: int('stepNo').notNull(),
    // State snapshots
    observation: text('observation', { mode: 'json' })
      .$type<AiPlaytestStepObservation>()
      .notNull(),
    action: text('action', { mode: 'json' })
      .$type<AiPlaytestStepAction>()
      .notNull(),
    result: text('result', { mode: 'json' })
      .$type<AiPlaytestStepResult>()
      .notNull(),
  },
  (table) => ({
    aiPlaytestStepRunIdIdx: index('aiPlaytestStepRunIdIdx').on(table.runId),
    aiPlaytestStepRoundNoIdx: index('aiPlaytestStepRoundNoIdx').on(
      table.runId,
      table.roundNo,
    ),
  }),
)

export const aiPlaytestStepRelations = relations(aiPlaytestStep, ({ one }) => ({
  run: one(aiPlaytestRun, {
    fields: [aiPlaytestStep.runId],
    references: [aiPlaytestRun.id],
  }),
}))
