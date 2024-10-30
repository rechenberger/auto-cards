import { z } from 'zod'
import { adventureTrail } from './adventureTrail'
import { DungeonDefinition } from './DungeonDefinition'
import { trainingGrounds } from './trainingGrounds'

const allDungeonNames = ['trainingGrounds', 'adventureTrail'] as const
export const DungeonName = z.enum(allDungeonNames)
export type DungeonName = z.infer<typeof DungeonName>

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
