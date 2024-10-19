import { LoadoutData } from '@/db/schema-zod'
import { capitalCase } from 'change-case'
import { keys, map, omitBy, range, sumBy, uniq } from 'lodash-es'
import { getItemByName } from './allItems'
import { ItemDefinition } from './ItemDefinition'
import { randomStats } from './randomStats'
import { Stat, Stats } from './stats'

export const calcStats = async ({ loadout }: { loadout: LoadoutData }) => {
  const items = await Promise.all(
    loadout.items.map(async (i) => {
      return {
        ...i,
        ...(await getItemByName(i.name)),
      }
    }),
  )
  return calcStatsFromItems({ items })
}

export const calcStatsFromItems = ({
  items,
}: {
  items: (ItemDefinition & { count?: number })[]
}) => {
  const stats = sumStats(
    ...items.flatMap((i) => range(i.count ?? 1).map(() => i.stats || {})),
  )
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
  return addStats(cloneStats(a), b)
}

export const cloneStats = (stats?: Stats) => {
  const result = {} as Stats
  for (const key in stats) {
    result[key as keyof Stats] = stats[key as keyof Stats]
  }
  return result
}

export const addStats = (a: Stats, b: Stats) => {
  for (const key in b) {
    const k = key as keyof Stats
    a[k] = (a[k] ?? 0) + (b[k] ?? 0)
  }
  return a
}

const statsThatCanBeNegative: string[] = [
  'health',
  ...randomStats,
] satisfies Stat[]
export const tryAddStats = (a: Stats, b: Stats) => {
  for (const key in b) {
    const k = key as keyof Stats
    a[k] = (a[k] || 0) + (b[k] || 0)
    if (!statsThatCanBeNegative.includes(key) && (a[k] || 0) < 0) {
      a[k] = 0
    }
  }
  limitMaxStats(a)
  return a
}

export const limitMaxStats = (stats: Stats) => {
  if (stats.healthMax && stats.health && stats.health > stats.healthMax) {
    stats.health = stats.healthMax
  }
  if (stats.staminaMax && stats.stamina && stats.stamina > stats.staminaMax) {
    stats.stamina = stats.staminaMax
  }
  return stats
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

export const hasAnyStats = ({ stats }: { stats: Stats }) => {
  for (const value of Object.values(stats)) {
    if (value) {
      return true
    }
  }
  return false
}

// export const multiplyStats = ({
//   stats,
//   multiplier,
// }: {
//   stats: Stats
//   multiplier: number
// }) => {
//   const result = { ...stats }
//   for (const key in result) {
//     const k = key as keyof Stats
//     if (result[k]) {
//       result[k] = result[k] * multiplier
//     }
//   }
//   return result
// }

// export const negativeStats = (stats: Stats) => {
//   return multiplyStats({ stats, multiplier: -1 })
// }
