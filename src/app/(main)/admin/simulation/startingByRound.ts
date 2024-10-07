import { getRoundStatsCumulative } from '@/game/roundStats'
import { SimulationInput } from './simulate'

export const startingByRound = (
  roundNo: number,
): Pick<SimulationInput, 'startingGold' | 'startingItems'> => {
  return {
    startingGold: getRoundStatsCumulative(roundNo).gold,
    startingItems: [
      { name: 'hero', count: 1 },
      {
        name: 'experience',
        count: getRoundStatsCumulative(roundNo).experience ?? 0,
      },
    ],
  }
}
