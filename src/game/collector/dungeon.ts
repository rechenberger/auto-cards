import { Game } from '@/db/schema-zod'
import {
  getDungeonAccess,
  removeDungeonAccess,
  setDungeonAccess,
} from '@/game/dungeons/DungeonAccess'
import { DungeonData } from '@/game/dungeons/DungeonData'
import { getDungeon } from '@/game/dungeons/allDungeons'
import { generateMatch } from '@/game/generateMatch'
import { seedToString } from '@/game/seed'
import { checkCollectorLoadout } from './checkCollectorLoadout'
import { addCollectorItem } from './items'

export const fightCollectorDungeon = async ({
  game,
  dungeonInput = game.data.dungeon,
  roomIdx = 0,
}: {
  game: Game
  dungeonInput?: Pick<DungeonData, 'name' | 'level' | 'seed'>
  roomIdx?: number
}) => {
  if (!dungeonInput) throw new Error('No dungeon input provided')

  const { seed, name, level } = dungeonInput
  const check = checkCollectorLoadout({
    loadout: game.data.currentLoadout,
    rulesetVersion: game.version,
  })
  if (!check.allGood) throw new Error(check.error)

  const dungeonAccess = getDungeonAccess({ game, name })
  if (!dungeonAccess) throw new Error('No access to dungeon')
  if (level < dungeonAccess.levelMin || level > dungeonAccess.levelMax) {
    throw new Error('Dungeon level is not unlocked')
  }

  const dungeon = getDungeon(name)
  const rewards = dungeon.rewards({ level })
  const generated = await dungeon.generate({
    game,
    level,
    seed: [seed],
    rewards,
  })
  const generatedRoom = generated.rooms[roomIdx]
  if (!generatedRoom) throw new Error('Dungeon room does not exist')

  const room: DungeonData['room'] = {
    ...generatedRoom,
    idx: roomIdx,
    seed: seedToString({ seed: [seed, 'room', roomIdx] }),
  }
  const hasNextRoom = generated.rooms.length > roomIdx + 1
  let status: DungeonData['status'] = hasNextRoom ? 'active' : 'completed'

  if (room.type === 'fight') {
    const report = generateMatch({
      participants: [
        { loadout: game.data.currentLoadout },
        { loadout: room.loadout },
      ],
      seed: [room.seed],
      skipLogs: true,
      rulesetVersion: game.version,
    })
    if (report.winner.sideIdx !== 0) status = 'failed'
  }

  if (room.type === 'reward') {
    for (const item of room.items) addCollectorItem({ game, item })
  }

  if (status === 'completed') {
    const completedPersonalMax = level === dungeonAccess.levelMax
    const completedGlobalMax = level === dungeon.levelMax
    if (completedPersonalMax) {
      dungeonAccess.levelMax = Math.min(
        dungeonAccess.levelMax + 1,
        dungeon.levelMax,
      )
      dungeonAccess.levelCurrent = dungeonAccess.levelMax

      let remove = false
      if (dungeon.levelOnlyOnce) {
        dungeonAccess.levelMin = dungeonAccess.levelMax
        remove = completedGlobalMax
      }
      dungeonAccess.levelCurrent = Math.max(
        Math.min(dungeonAccess.levelCurrent, dungeonAccess.levelMax),
        dungeonAccess.levelMin,
      )

      if (remove) removeDungeonAccess({ game, name })
      else setDungeonAccess({ game, dungeonAccess })
    }
  }

  game.data.dungeon = { name, level, seed, status, room }
}
