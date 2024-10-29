import { Game } from '@/db/schema-zod'
import { DungeonData } from '@/game/DungeonData'
import { getDungeon } from '@/game/dungeons'
import { generateMatch } from '@/game/generateMatch'
import { seedToString } from '@/game/seed'

export const fightDungeon = ({
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

  const dungeon = getDungeon(name)
  const generated = dungeon.generate({
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
    game.data.currentLoadout.items.push(...room.items)
  }

  game.data.dungeon = {
    name,
    level,
    seed,

    status,
    room,
  }
}
