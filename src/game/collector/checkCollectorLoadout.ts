import { getItemByName } from '@/game/allItems'
import { LoadoutData } from '@/game/LoadoutData'
import { COLLECTOR_PRICE_LIMIT, COLLECTOR_SAME_ITEM_LIMIT } from '@/game/rules'
import { GameVersion } from '@/game/gameVersion'
import { capitalCase } from 'change-case'
import { countBy, map, sumBy } from 'lodash-es'

export const checkCollectorLoadout = ({
  loadout,
  rulesetVersion,
}: {
  loadout: LoadoutData
  rulesetVersion: GameVersion
}) => {
  const items = loadout.items.map((item) => ({
    ...item,
    def: getItemByName(item.name, rulesetVersion),
  }))

  const priceLimit = COLLECTOR_PRICE_LIMIT
  const priceCurrent = sumBy(items, (item) => item.def.price)
  const priceInBudget = priceCurrent <= priceLimit

  const countRaw = countBy(items, (item) => item.name)
  const countItems = map(countRaw, (count, name) => {
    const item = items.find((candidate) => candidate.name === name)
    if (!item) throw new Error(`Item ${name} not found`)
    const countMax = item.def.unique ? 1 : COLLECTOR_SAME_ITEM_LIMIT
    return {
      ...item,
      name,
      count,
      countMax,
      countInBudget: count <= countMax,
    }
  })
  const countTooMany = countItems.filter((item) => !item.countInBudget)
  const countInBudget = countTooMany.length === 0
  const allGood = priceInBudget && countInBudget

  const error = allGood
    ? undefined
    : [
        ...(!priceInBudget
          ? [`Over Weight Limit: ${priceCurrent}/${priceLimit}`]
          : []),
        ...(!countInBudget
          ? [
              `Over Item Limit: ${countTooMany
                .map((item) => capitalCase(item.name))
                .join(', ')}`,
            ]
          : []),
      ].join(', ')

  return {
    priceCurrent,
    priceLimit,
    priceInBudget,
    countTooMany,
    countInBudget,
    allGood,
    error,
  }
}
