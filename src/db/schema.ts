import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './schema-auth'

export * from './schema-auth'

export const games = sqliteTable('game', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('userId').notNull(),
  data: text('metadata', { mode: 'json' }).$type<any>().notNull(),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
})

export const gameRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
}))
