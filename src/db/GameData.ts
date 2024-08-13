import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { schema } from './schema-export'

export const GameData = z.object({
  version: z.number().default(1),
})
export type GameData = z.infer<typeof GameData>

export const Game = createSelectSchema(schema.games, {
  data: GameData,
})
export type Game = z.infer<typeof Game>
