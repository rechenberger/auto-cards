import { COOLDOWN_PRECISION, MIN_COOLDOWN } from './config'
import { Stats } from './stats'
import { Tag } from './tags'

export const calcCooldown = ({
  cooldown,
  stats,
  tags,
}: {
  cooldown: number
  stats: Stats
  tags: Tag[]
}) => {
  let divisor = 1
  let multiplier = 1
  if (stats.slow) {
    multiplier += stats.slow / 100
  }
  if (stats.haste) {
    divisor += stats.haste / 100
  }
  if (stats.drunk && tags.includes('food')) {
    divisor += stats.drunk / 100
  }
  if (stats.hungry && tags.includes('food')) {
    divisor += stats.hungry / 100
  }

  let result = (cooldown / divisor) * multiplier
  result = Math.ceil(result / COOLDOWN_PRECISION) * COOLDOWN_PRECISION
  result = Math.max(result, MIN_COOLDOWN)
  return result
}
