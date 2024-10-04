import { Game } from '@/db/schema-zod'
import { ItemName } from '@/game/allItems'
import { GAME_VERSION } from '@/game/config'
import { rngGenerator, SeedArray, seedToString } from '@/game/seed'
import { typedParse } from '@/lib/typedParse'
import { range } from 'lodash-es'
import { generateRandomLoadout } from './generateRandomLoadout'

export type BotGame = Awaited<ReturnType<typeof generateBotsWithItems>>[number]

export const generateBotsWithItems = async ({
  noOfBots,
  simulationSeed,
  startingGold = 10,
  startingItems = ['hero'],
}: {
  noOfBots: number
  simulationSeed: SeedArray
  startingGold?: number
  startingItems?: ItemName[]
}) => {
  const bots = range(noOfBots).map((idx) => {
    return {
      name: `Bot ${idx}`,
      seed: [...simulationSeed, 'bot', idx],
      wins: 0,
      matches: 0,
      draws: 0,
      time: 0,
      simulationRounds: 0,
    }
  })

  const botsWithGame = await Promise.all(
    bots.map(async (bot) => {
      const items = startingItems.map((name) => ({ name }))

      const seed = seedToString({ seed: [...bot.seed, 'game'] })

      const game = typedParse(Game, {
        id: `simulation-${bot.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'nope',
        data: {
          currentLoadout: {
            items,
          },
          gold: startingGold,
          roundNo: 0,
          seed,
          shopItems: [],
          shopRerolls: 0,
          version: 1,
        },
        liveMatchId: null,
        version: GAME_VERSION,
      })

      const { loadout, goldRemaining } = await generateRandomLoadout({
        gold: game.data.gold,
        seed: rngGenerator({ seed }),
      })

      game.data.gold = goldRemaining
      game.data.currentLoadout = loadout

      return {
        ...bot,
        game,
      }
    }),
  )

  return botsWithGame
}
