import { getRoundStatsCumulative } from '@/game/roundStats'
import { range } from 'lodash-es'
import { SimulationInput } from './simulate'

export const startingByRound = (
  roundNo: number,
): Pick<SimulationInput, 'startingGold' | 'startingItems'> => {
  return {
    startingGold: getRoundStatsCumulative(roundNo).gold,
    startingItems: [
      'hero',
      ...range(getRoundStatsCumulative(roundNo).experience ?? 0).map(
        () => 'experience' as const,
      ),
    ],
  }
}
