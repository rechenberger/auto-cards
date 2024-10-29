import { Game } from '@/db/schema-zod'
import { getItemByName } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { sumBy } from 'lodash-es'

export const checkCollectorLoadout = async ({ game }: { game: Game }) => {
  const items = await Promise.all(
    game.data.currentLoadout.items.map(async (item) => ({
      ...item,
      def: await getItemByName(item.name),
    })),
  )

  // Check price
  const priceLimit = 100
  const priceCurrent = sumBy(items, (i) => i.def.price)
  const priceInBudget = priceCurrent <= priceLimit

  // Check item counts
  const countItems = countifyItems(items, {
    ignoreAspects: true,
  }).map((item) => {
    const count = item.count ?? 1
    const countMax = item.def.unique ? 1 : 3
    const countInBudget = count <= countMax
    return { ...item, count, countMax, countInBudget }
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
