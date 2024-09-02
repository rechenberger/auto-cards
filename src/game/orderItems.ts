import { first, indexOf, map, orderBy } from 'lodash-es'
import { getItemByName } from './allItems'
import { allRarities } from './rarities'
import { allTags } from './tags'

export const orderItems = async <T extends { name: string }>(items: T[]) => {
  let withItems = await Promise.all(
    items.map(async (item) => ({
      item,
      def: await getItemByName(item.name),
    })),
  )
  withItems = orderBy(
    withItems,
    (i) => indexOf(allRarities, i.def.rarity),
    'asc',
  )
  withItems = orderBy(
    withItems,
    (i) => indexOf(allTags, first(i.def.tags) ?? 'default'),
    'asc',
  )
  return map(withItems, (i) => i.item)
}
