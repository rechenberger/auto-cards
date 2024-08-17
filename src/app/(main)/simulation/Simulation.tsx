import { ItemName } from '@/game/allItems'
import { SeedArray } from '@/game/seed'
import { simulate } from './simulate'
import { SimulationDisplay } from './SimulationDisplay'

export type SimulationInput = {
  noOfBots: number
  noOfRepeats: number
  simulationSeed: SeedArray
  startingGold: number
  startingItems: ItemName[]
  noOfBotsSelected: number
  noOfSelectionRounds: number
}

export async function Simulation({ input }: { input: SimulationInput }) {
  const simulationResult = await simulate({ input })

  return (
    <>
      <SimulationDisplay input={input} simulationResult={simulationResult} />
    </>
  )
}
