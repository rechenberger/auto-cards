import { sumBy } from 'lodash-es'
import { ItemDefinition } from './ItemDefinition'

export type SimpleMatchData = {
  itemCounts: number[][]
  winner: number
}

export const toSimpleMatchDataItemCounts = ({
  items,
  allItems,
}: {
  items: { name: string; count?: number }[]
  allItems: ItemDefinition[]
}) => {
  const counts = allItems.map((item) => {
    const count = sumBy(items, (i) => (i.name === item.name ? i.count ?? 1 : 0))
    return count
  })

  return counts
}
