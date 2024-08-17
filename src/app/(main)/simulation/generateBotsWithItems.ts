import { Game } from '@/db/schema-zod'
import { getItemByName, ItemName } from '@/game/allItems'
import { calcStats, hasNegativeStats } from '@/game/calcStats'
import { generateShopItems } from '@/game/generateShopItems'
import { SeedArray, seedToString } from '@/game/seed'
import { fn } from '@/lib/fn'
import { typedParse } from '@/lib/typedParse'
import { first, range } from 'lodash-es'

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
      })

      game.data.shopItems = await generateShopItems({ game })

      while (true) {
        const shopItems = await Promise.all(
          game.data.shopItems.map(async (shopItem, idx) => {
            const item = await getItemByName(shopItem.name)
            const buyable = await fn(async () => {
              if (shopItem.isSold) {
                return false
              }

              if (item.price > game.data.gold) {
                return false
              }

              const stats = await calcStats({
                loadout: {
                  ...game.data.currentLoadout,
                  items: [
                    ...game.data.currentLoadout.items,
                    { name: shopItem.name },
                  ],
                },
              })
              if (hasNegativeStats({ stats })) {
                return false
              }

              return true
            })

            return {
              ...shopItem,
              idx,
              item,
              buyable,
            }
          }),
        )
        const buyables = shopItems.filter((item) => item.buyable)

        const item = first(buyables)
        if (!item) {
          // REROLL
          const rerollPrice = 1
          if (game.data.gold >= rerollPrice) {
            game.data.gold -= rerollPrice
            game.data.shopRerolls++
            game.data.shopItems = await generateShopItems({ game })
            continue
          }

          // Not enough gold to reroll
          break
        }

        game.data.gold -= item.item.price
        game.data.shopItems[item.idx].isSold = true
        game.data.currentLoadout.items.push({ name: item.name })
      }

      return {
        ...bot,
        game,
      }
    }),
  )
  console.log(
    botsWithGame.map((b) =>
      b.game.data.currentLoadout.items.map((i) => i.name),
    ),
  )

  return botsWithGame
}
