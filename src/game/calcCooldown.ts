import { COOLDOWN_PRECISION, MIN_COOLDOWN } from './config'
import { Stats } from './stats'

export const calcCooldown = ({
  cooldown,
  stats,
}: {
  cooldown: number
  stats: Stats
}) => {
  let multiplier = 1
  if (stats.slow) {
    multiplier += stats.slow / 100
  }
  if (stats.haste) {
    multiplier -= stats.haste / 100
  }

  let result = cooldown * multiplier
  result = Math.ceil(result / COOLDOWN_PRECISION) * COOLDOWN_PRECISION
  result = Math.max(result, MIN_COOLDOWN)
  return result
}
