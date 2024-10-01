import { LoadoutData } from '@/db/schema-zod'
import { capitalCase } from 'change-case'
import { keys, map, omitBy, range, sum, sumBy, uniq } from 'lodash-es'
import { getItemByName } from './allItems'
import { randomStats } from './randomStats'
import { Stat, Stats } from './stats'

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export const calcStats = async ({ loadout }: { loadout: LoadoutData }) => {
  const items = await Promise.all(
    loadout.items.map(async (i) => {
      return {
        ...i,
        item: await getItemByName(i.name),
      }
    }),
  )

  const stats = sumStats(
    ...items.flatMap((i) => range(i.count ?? 1).map(() => i.item.stats || {})),
  )

  const totalStaminaRegenPerSecond = sumBy(items, (i) => {
    const regenAmount = i.item.stats?.staminaRegen ?? 0;

    let totalRegenFromTriggers = 0;
    let totalCooldownInMilliseconds = 0;

    i.item.triggers?.forEach((t) => {
      if (t.statsSelf?.stamina) {
        totalRegenFromTriggers += t.statsSelf.stamina;
        totalCooldownInMilliseconds += t.type === 'interval' ? t.cooldown ?? 1000 : 1000;
      }
    });

    const otherRegen = totalRegenFromTriggers < 0 ? 0 : totalRegenFromTriggers;
    const cooldownInSeconds = totalCooldownInMilliseconds === 0 ? 1 : totalCooldownInMilliseconds / 1000;

    return cooldownInSeconds > 0 ? (regenAmount + otherRegen) / cooldownInSeconds : 0;
  });

  const totalStaminaUsagePerSecond = sumBy(items, (i) => {
    let totalStaminaUsage = 0;
    let totalCooldownInMilliseconds = 0;

    i.item.triggers?.forEach((t) => {
      if (t.statsRequired?.stamina && t.type === 'interval') {
        totalStaminaUsage += t.statsRequired.stamina;
        totalCooldownInMilliseconds += t.cooldown ?? 1000;
      }
    });

    const cooldownInSeconds = totalCooldownInMilliseconds === 0 ? 1 : totalCooldownInMilliseconds / 1000;

    const res = totalStaminaUsage / cooldownInSeconds;

    return res;
  });


  return {
    ...stats,
    staminaRegen: numberFormatter.format(totalStaminaRegenPerSecond),
    staminaUsage: numberFormatter.format(totalStaminaUsagePerSecond)

  }
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
    const k = key as keyof Stats
    a[k] = (a[k] || 0) + (b[k] || 0)
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
  return !!keys(omitBy(stats, (v) => v === undefined || v === 0)).length
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
