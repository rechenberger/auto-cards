import { createSeed } from '@/game/seed'
import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { schema } from './schema-export'

const seed = z.string().default(() => createSeed())

export const LoadoutData = z.object({
  items: z.array(z.object({ name: z.string() })),
})
export type LoadoutData = z.infer<typeof LoadoutData>

export const Loadout = createSelectSchema(schema.loadout, {
  data: LoadoutData,
})
export type Loadout = z.infer<typeof Loadout>

export const GameData = z.object({
  version: z.number().default(1),
  seed,
  roundNo: z.number().default(0),
  gold: z.number().default(0),
  shopRerolls: z.number().default(0),
  shopItems: z.array(
    z.object({
      name: z.string(),
      isOnSale: z.boolean().optional(),
      isReserved: z.boolean().optional(),
      isSold: z.boolean().optional(),
    }),
  ),
  currentLoadout: LoadoutData,
})
export type GameData = z.infer<typeof GameData>

export const Game = createSelectSchema(schema.game, {
  data: GameData,
})
export type Game = z.infer<typeof Game>

export const MatchData = z.object({
  seed,
})
export type MatchData = z.infer<typeof MatchData>

export const Match = createSelectSchema(schema.match, {
  data: MatchData,
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
