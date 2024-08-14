import { db } from '@/db/db'
import { Game } from '@/db/schema-zod'

export const getGameFromDb = async ({ id }: { id: string }) => {
  const game = await db.query.game.findFirst({
    where: (s, { eq }) => eq(s.id, id),
  })
  if (!game) {
    throw new Error('Game not found')
  }
  return Game.parse(game)
}
