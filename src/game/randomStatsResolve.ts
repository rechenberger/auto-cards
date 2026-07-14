import { filter, mapValues, some, times } from 'lodash-es'
import { tryAddStats } from './calcStats'
import { RandomStat, randomStatRules } from './randomStatRules'
import { rngItem, SeedRng } from './seed'
import { HeroStat, Stats } from './statSchemas'

export const randomStatsResolve = ({
  stats,
  seed,
  onRandomStat,
}: {
  stats: Stats
  seed: SeedRng
  onRandomStat?: (props: { stats: Stats; randomStat: RandomStat }) => void
}) => {
  for (const randomStatDefinition of randomStatRules) {
    const randomStatValue = stats[randomStatDefinition.name]
    if (!randomStatValue) {
      continue
    }

    delete stats[randomStatDefinition.name]

    const isNegative = randomStatValue < 0
    let candidates: readonly Partial<Record<HeroStat, number>>[] =
      randomStatDefinition.randomStats
    times(Math.abs(randomStatValue), (idx) => {
      if (isNegative) {
        // Only pick stats that are already present
        candidates = filter(candidates, (randomsStats) =>
          some(
            randomsStats,
            (value, stat) => !!stats[stat as keyof typeof stats],
          ),
        )
      }
      if (!candidates.length) {
        return
      }
      let pickedStats: Stats = rngItem({
        seed,
        items: candidates,
      })
      if (isNegative) {
        pickedStats = mapValues(pickedStats, (value) => -1 * (value ?? 0))
      }
      tryAddStats(stats, pickedStats)
      onRandomStat?.({
        stats: pickedStats,
        randomStat: randomStatDefinition.name,
      })
    })
  }

  return stats
}
