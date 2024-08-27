import { COOLDOWN_PRECISION, MIN_COOLDOWN } from './config'
import { Stats } from './stats'

export const calcCooldown = ({
  cooldown,
  stats,
}: {
  cooldown: number
  stats: Stats
}) => {
  const slow = stats.slow ?? 0
  const haste = stats.haste ?? 0
  let result = Math.max(cooldown * (1 + (slow - haste) / 100), MIN_COOLDOWN)
  result = Math.ceil(result * COOLDOWN_PRECISION) / COOLDOWN_PRECISION
  return result
}
