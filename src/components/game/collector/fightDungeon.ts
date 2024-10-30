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
import { addCollectorItem } from './addCollectorItem'
import { checkCollectorLoadout } from './checkCollectorLoadout'

export const fightDungeon = async ({
  game,
  dungeonInput = game.data.dungeon,
  roomIdx = 0,
}: {
  game: Game
  dungeonInput?: Pick<DungeonData, 'name' | 'level' | 'seed'>
  roomIdx?: number
}) => {
  if (!dungeonInput) {
    throw new Error('No dungeon input provided')
  }

  const seed = dungeonInput.seed
  const name = dungeonInput.name
  const level = dungeonInput.level

  const check = await checkCollectorLoadout({
    loadout: game.data.currentLoadout,
  })
  if (!check.allGood) {
    throw new Error(check.error)
  }

  const dungeonAccess = getDungeonAccess({
    game,
    name,
  })

  if (!dungeonAccess) {
    throw new Error('No access to dungeon')
  }

  const dungeon = getDungeon(name)
  const generated = await dungeon.generate({
    game,
    level,
    seed: [seed],
  })

  const generatedRoom = generated.rooms[roomIdx]
  const room: DungeonData['room'] = {
    ...generatedRoom,
    idx: roomIdx,
    seed: seedToString({
      seed: [seed, 'room', roomIdx],
    }),
  }
  const hasNextRoom = generated.rooms.length > roomIdx + 1
  let status: DungeonData['status'] = hasNextRoom ? 'active' : 'completed'

  if (room.type === 'fight') {
    const matchReport = generateMatch({
      participants: [
        {
          loadout: game.data.currentLoadout,
        },
        {
          loadout: room.loadout,
        },
      ],
      seed: [room.seed],
      skipLogs: true,
    })
    const won = matchReport.winner.sideIdx === 0
    if (!won) {
      status = 'failed'
    }
  }

  if (room.type === 'reward') {
    for (const item of room.items) {
      await addCollectorItem({
        game,
        item,
      })
    }
  }

  if (status === 'completed') {
    const didPersonalMaxLevel = level === dungeonAccess.levelMax
    const didGlobalMaxLevel = level === dungeon.levelMax
    if (didPersonalMaxLevel) {
      dungeonAccess.levelMax = Math.min(
        dungeonAccess.levelMax + 1,
        dungeon.levelMax,
      )
      dungeonAccess.levelCurrent = dungeonAccess.levelMax

      let remove = false
      if (dungeon.levelOnlyOnce) {
        dungeonAccess.levelMin = dungeonAccess.levelMax
        if (didGlobalMaxLevel) {
          remove = true
        }
      }

      dungeonAccess.levelCurrent = Math.max(
        Math.min(dungeonAccess.levelCurrent, dungeonAccess.levelMax),
        dungeonAccess.levelMin,
      )

      if (remove) {
        removeDungeonAccess({
          game,
          name,
        })
      } else {
        setDungeonAccess({
          game,
          dungeonAccess,
        })
      }
    }
  }

  game.data.dungeon = {
    name,
    level,
    seed,

    status,
    room,
  }
}
