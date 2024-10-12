import { Game } from '@/db/schema-zod'
import { roundStats } from './roundStats'

export const getSpecialBuyRound = ({ game }: { game: Game }) => {
  const roundStat = roundStats[game.data.roundNo]
  if (!roundStat) return undefined
  if (game.data.shopRerolls !== 0) return undefined
  return roundStat.specialBuyRound
}
