import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { COLLECTOR_PRICE_LIMIT, COLLECTOR_SAME_ITEM_LIMIT } from '@/game/config'
import { countBy, map, sumBy } from 'lodash-es'

export const checkCollectorLoadout = async ({ game }: { game: Game }) => {
  const items = await Promise.all(
    game.data.currentLoadout.items.map(async (item) => ({
      ...item,
      def: await getItemByName(item.name),
    })),
  )

  // Check price
  const priceLimit = COLLECTOR_PRICE_LIMIT
  const priceCurrent = sumBy(items, (i) => i.def.price)
  const priceInBudget = priceCurrent <= priceLimit

  // Check item counts
  const countRaw = countBy(items, (i) => i.name)
  const countItems = map(countRaw, (count, name) => {
    const item = items.find((i) => i.name === name)
    if (!item) {
      throw new Error(`Item ${name} not found`)
    }
    const countMax = item.def?.unique ? 1 : COLLECTOR_SAME_ITEM_LIMIT
    const countInBudget = count <= countMax

    return {
      ...item,
      name,
      count,
      countMax,
      countInBudget,
    }
  })
  const countTooMany = countItems.filter((i) => !i.countInBudget)
  const countInBudget = countTooMany.length === 0

  // Check all
  const allGood = priceInBudget && countInBudget

  return {
    priceCurrent,
    priceLimit,
    priceInBudget,

    countTooMany,
    countInBudget,

    allGood,
  }
}
