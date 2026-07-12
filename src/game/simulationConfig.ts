import { ItemName } from './allItems'
import { getRoundStatsCumulative } from './roundStats'

export const getSimulationStartForRound = (
  roundNo: number,
): {
  startingGold: number
  startingItems: ItemName[]
} => {
  const cumulative = getRoundStatsCumulative(roundNo)
  return {
    startingGold: cumulative.gold,
    startingItems: [
      'hero',
      ...Array.from(
        { length: cumulative.experience ?? 0 },
        () => 'experience' as const,
      ),
    ],
  }
}
