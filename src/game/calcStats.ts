import { LoadoutData } from '@/db/schema-zod'
import { capitalCase } from 'change-case'
import { keys, map, omitBy, sumBy, uniq } from 'lodash-es'
import { getItemByName } from './allItems'
import { Stats } from './stats'

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

export const sumStats = (...allStats: Stats[]) => {
  const allKeys = uniq(allStats.flatMap(keys)) as (keyof Stats)[]
  const result: Stats = {}
  for (const key of allKeys) {
    result[key] = sumBy(allStats, (stats) => stats[key] ?? 0)
  }
  return result
}

const getNegativeStats = ({ stats }: { stats: Stats }) => {
  return omitBy(stats, (v) => v === undefined || v >= 0) as Stats
}

export const hasNegativeStats = ({ stats }: { stats: Stats }) => {
  return !!keys(getNegativeStats({ stats })).length
}

export const throwIfNegativeStats = ({ stats }: { stats: Stats }) => {
  const negativeStats = getNegativeStats({ stats })
  const isNegative = !!keys(negativeStats).length
  if (isNegative) {
    throw new Error(
      `Not enough ${map(
        negativeStats,
        (v, k) => `${capitalCase(k)} (missing ${-1 * (v ?? 0)})`,
      ).join(', ')}`,
    )
  }
}
