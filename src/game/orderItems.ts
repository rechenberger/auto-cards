import { first, indexOf, map, orderBy } from 'lodash-es'
import { ItemDefinition } from './ItemDefinition'
import { ItemName, getItemByName } from './allItems'
import { DEFAULT_GAME_VERSION, GameVersion } from './gameVersion'
import { allRarities } from './rarities'
import { allTags } from './tags'

export const orderItems = <T extends { name: ItemName }>(
  items: T[],
  gameVersion: GameVersion = DEFAULT_GAME_VERSION,
) => {
  let withItems = items.map((item) => ({
    item,
    def: getItemByName(item.name, gameVersion),
  }))
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

export const orderItemsWithoutLookup = <T extends ItemDefinition>(
  items: T[],
) => {
  items = orderBy(items, (i) => indexOf(allRarities, i.rarity), 'asc')
  items = orderBy(
    items,
    (i) => indexOf(allTags, first(i.tags) ?? 'default'),
    'asc',
  )
  return items
}
