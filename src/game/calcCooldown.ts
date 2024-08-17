import { MIN_COOLDOWN } from './config'
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
  const result = Math.max(cooldown * (1 + (slow - haste) / 100), MIN_COOLDOWN)
  return result
}
