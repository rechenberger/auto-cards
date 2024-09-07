import { filter, mapValues, some, times } from 'lodash-es'
import { tryAddStats } from './calcStats'
import { randomStatDefinitions } from './randomStats'
import { rngItem, Seed } from './seed'
import { Stats } from './stats'

export const randomStatsResolve = ({
  stats,
  seed,
}: {
  stats: Stats
  seed: Seed
}) => {
  for (const randomStatDefinition of randomStatDefinitions) {
    const randomStatValue = stats[randomStatDefinition.name]
    if (!randomStatValue) {
      continue
    }

    delete stats[randomStatDefinition.name]

    const isNegative = randomStatValue < 0
    let candidates = randomStatDefinition.randomStats
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
      let pickedStats = rngItem({
        seed: [...seed, randomStatDefinition.name, idx],
        items: candidates,
      })
      if (isNegative) {
        pickedStats = mapValues(pickedStats, (value) => -1 * (value ?? 0))
      }
      tryAddStats(stats, pickedStats)
    })
  }

  return stats
}
