import { LoadoutData } from '@/db/schema-zod'
import { Stats } from '@/game/zod-schema'
import { keys, sumBy, uniq } from 'lodash-es'
import { getItemByName } from './allItems'

export const calcStats = async ({ loadout }: { loadout: LoadoutData }) => {
  const items = await Promise.all(
    loadout.items.map(async (i) => {
      return {
        ...i,
        item: await getItemByName(i.name),
      }
    }),
  )
  const stats = sumStats(...items.map((i) => i.item.stats || {}))
  return stats
}

const sumStats = (...allStats: Stats[]) => {
  const allKeys = uniq(allStats.flatMap(keys)) as (keyof Stats)[]
  const result: Stats = {}
  for (const key of allKeys) {
    result[key] = sumBy(allStats, (stats) => stats[key] ?? 0)
  }
  return result
}
