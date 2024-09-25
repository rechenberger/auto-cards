import { Game } from '@/db/schema-zod'
import { getAllItems, ItemName } from '@/game/allItems'
import { GAME_VERSION } from '@/game/config'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { rngItem, SeedArray, seedToString } from '@/game/seed'
import { typedParse } from '@/lib/typedParse'
import { range } from 'lodash-es'

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
          seed: seedToString({ seed: [...bot.seed, 'game'] }),
          shopItems: [],
          shopRerolls: 0,
          version: 1,
        },
        liveMatchId: null,
        version: GAME_VERSION,
      })

      while (game.data.gold > 0) {
        let buyables = await getAllItems()
        buyables = buyables.filter(
          (item) => item.price && item.price <= game.data.gold, // TODO: check negative stats?
        )
        const item = rngItem({
          seed: [bot.seed, 'buy', game.data.gold],
          items: buyables,
        })
        if (!item) {
          break
        }

        game.data.gold -= item.price
        game.data.currentLoadout.items.push({ name: item.name })
      }

      game.data.currentLoadout.items = await orderItems(
        countifyItems(game.data.currentLoadout.items),
      )

      return {
        ...bot,
        game,
      }
    }),
  )

  return botsWithGame
}
