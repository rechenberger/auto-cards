import { adventureTrail } from './adventureTrail'
import { DungeonDefinition } from './DungeonDefinition'
import { DungeonName } from './dungeonSchema'
import { trainingGrounds } from './trainingGrounds'

export { DungeonName } from './dungeonSchema'

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
