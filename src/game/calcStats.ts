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
  if (allStats.length === 2) return sumStats2(allStats[0], allStats[1])
  const allKeys = uniq(allStats.flatMap(keys)) as (keyof Stats)[]
  const result: Stats = {}
  for (const key of allKeys) {
    result[key] = sumBy(allStats, (stats) => stats[key] ?? 0)
  }
  return result
}

export const sumStats2 = (a: Stats, b: Stats) => {
  return addStats({ ...a }, b)
}

export const addStats = (a: Stats, b: Stats) => {
  for (const key in b) {
    // @ts-expect-error
    a[key] = (a[key] || 0) + (b[key] || 0)
  }
  return a
}

export const tryAddStats = (a: Stats, b: Stats) => {
  for (const key in b) {
    const k = key as keyof Stats
    a[k] = (a[k] || 0) + (b[k] || 0)
    if (key !== 'health' && a[k] < 0) {
      a[k] = 0
    }
  }
  return a
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

export const hasStats = (a: Stats, b: Stats) => {
  for (const [key, value] of Object.entries(b)) {
    const k = key as keyof Stats
    const current = a[k] ?? 0
    if (current < value) {
      return false
    }
  }
  return true
}
