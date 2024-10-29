import { Game } from '@/db/schema-zod'
import { z } from 'zod'
import { DungeonName } from './dungeons'

export const DungeonAccess = z.object({
  name: DungeonName,
  levelMin: z.number(),
  levelMax: z.number(),
  levelCurrent: z.number(),
})
export type DungeonAccess = z.infer<typeof DungeonAccess>

export const getDungeonAccess = ({
  game,
  name,
}: {
  game: Game
  name: DungeonName
}) => {
  const accesses = game.data.dungeonAccesses ?? []
  const access = accesses.find((access) => access.name === name)
  return access
}

export const setDungeonAccess = ({
  game,
  dungeonAccess,
}: {
  game: Game
  dungeonAccess: DungeonAccess
}) => {
  const accesses = game.data.dungeonAccesses ?? []
  const index = accesses.findIndex(
    (access) => access.name === dungeonAccess.name,
  )
  if (index === -1) {
    accesses.push(dungeonAccess)
  } else {
    accesses[index] = dungeonAccess
  }
  game.data.dungeonAccesses = accesses
}

export const startingDungeonAccesses: DungeonAccess[] = [
  { name: 'trainingGrounds', levelMin: 1, levelMax: 1, levelCurrent: 1 },
  { name: 'adventureTrail', levelMin: 1, levelMax: 1, levelCurrent: 1 },
]
