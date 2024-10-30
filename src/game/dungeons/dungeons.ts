import { ItemData } from '@/components/game/ItemData'
import { Game } from '@/db/schema-zod'
import { z } from 'zod'
import { LoadoutData } from '../LoadoutData'
import { SeedArray } from '../seed'
import { adventureTrail } from './adventureTrail'
import { trainingGrounds } from './trainingGrounds'

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

const allDungeonNames = ['trainingGrounds', 'adventureTrail'] as const
export const DungeonName = z.enum(allDungeonNames)
export type DungeonName = z.infer<typeof DungeonName>

export type DungeonDefinition = {
  name: DungeonName
  description: string
  levelMax: number
  levelOnlyOnce?: boolean
  generate: (ctx: { game: Game; seed: SeedArray; level: number }) => Promise<{
    rooms: DungeonRoom[]
  }>
}

export const allDungeons: DungeonDefinition[] = [
  trainingGrounds,
  adventureTrail,
]

export const getDungeon = (name: DungeonName) => {
  const dungeon = allDungeons.find((dungeon) => dungeon.name === name)
  if (!dungeon) {
    throw new Error(`Dungeon ${name} not found`)
  }
  return dungeon
}
