import { LoadoutData } from '@/db/schema-zod'
import { sum } from 'lodash-es'
import { getItemByName } from './allItems'

export const calcLoadoutPrice = async (loadout: LoadoutData) => {
  const prices = await Promise.all(
    loadout.items.map(async (item) => {
      const def = await getItemByName(item.name)
      return def.price * (item.count ?? 1)
    }),
  )
  return sum(prices)
}
