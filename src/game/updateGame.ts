import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game } from '@/db/schema-zod'
import { eq } from 'drizzle-orm'
import { first } from 'lodash-es'

export const updateGame = async ({ game }: { game: Game }) => {
  await db
    .update(schema.game)
    .set({
      ...game,
      createdAt: undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.game.id, game.id))
    .returning()
    .then(first)
}
