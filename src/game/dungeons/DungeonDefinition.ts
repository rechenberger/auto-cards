import { Game } from '@/db/schema-zod'
import { z } from 'zod'
import { ItemData } from '../ItemData'
import { LoadoutData } from '../LoadoutData'
import { RarityWeights } from '../rarities'
import { SeedArray } from '../seed'
import { DungeonName } from './dungeonSchema'

export const DungeonRoom = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('fight'),
    loadout: LoadoutData,
  }),
  z.object({
    type: z.literal('reward'),
    items: z.array(ItemData),
  }),
])
export type DungeonRoom = z.infer<typeof DungeonRoom>

export const DungeonRewards = z.object({
  rarityWeights: RarityWeights,
})
export type DungeonRewards = z.infer<typeof DungeonRewards>

export type DungeonDefinition = {
  name: DungeonName
  description: string
  levelMax: number
  levelOnlyOnce?: boolean
  generate: (ctx: {
    game: Game
    seed: SeedArray
    level: number
    rewards: DungeonRewards
  }) => Promise<{
    rooms: DungeonRoom[]
  }>
  rewards: (ctx: { level: number }) => DungeonRewards
}
