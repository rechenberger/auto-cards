import { GAME_VERSION } from '@/game/config'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './schema-auth'
import {
  GameData,
  LiveMatchData,
  LiveMatchParticipationData,
  LiveMatchStatus,
  LoadoutData,
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

export const game = sqliteTable('game', {
  ...baseStats(),
  userId: text('userId').notNull(),
  data: text('data', { mode: 'json' }).$type<GameData>().notNull(),
  liveMatchId: text('liveMatchId'),
  version,
})

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
  },
  (table) => ({
    loadoutPrimaryMatchParticipationIdIdx: index(
      'loadoutPrimaryMatchParticipationIdIdx',
    ).on(table.primaryMatchParticipationId),
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
  },
  (table) => ({
    leaderboardUserIdIdx: index('leaderboardUserIdIdx').on(table.userId),
    leaderboardTypeRoundNoScoreIdx: index('leaderboardTypeRoundNoScoreIdx').on(
      table.type,
      table.roundNo,
      table.score,
    ),
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
