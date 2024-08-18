import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './schema-auth'
import { GameData, LoadoutData, MatchData } from './schema-zod'

export * from './schema-auth'

const baseStats = () => ({
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
})

export const game = sqliteTable('game', {
  ...baseStats(),
  userId: text('userId').notNull(),
  data: text('data', { mode: 'json' }).$type<GameData>().notNull(),
})

export const gameRelations = relations(game, ({ one, many }) => ({
  user: one(users, {
    fields: [game.userId],
    references: [users.id],
  }),
  loadouts: many(loadout),
  matches: many(match),
}))

export const loadout = sqliteTable('loadout', {
  ...baseStats(),
  userId: text('userId'),
  data: text('data', { mode: 'json' }).$type<LoadoutData>().notNull(),
  gameId: text('gameId'),
  roundNo: int('roundNo').notNull(),
  primaryMatchParticipationId: text('primaryMatchParticipationId'),
})

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
})

export const matchRelations = relations(match, ({ one, many }) => ({
  game: one(game, {
    fields: [match.id],
    references: [game.id],
  }),
  matchParticipations: many(matchParticipation),
}))

export const matchParticipation = sqliteTable('matchParticipation', {
  ...baseStats(),
  data: text('data', { mode: 'json' }).$type<object>().notNull(),
  matchId: text('matchId').notNull(),
  userId: text('userId').notNull(),
  loadoutId: text('loadoutId').notNull(),
  sideIdx: int('sideIdx').notNull(),
  status: text('stats').$type<'won' | 'lost'>().notNull(),
})

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

export const aiImage = sqliteTable('aiImage', {
  ...baseStats(),
  prompt: text('prompt').notNull(),
  url: text('url').notNull(),
  itemId: text('itemId'),
})
