import { getAllItems, ItemName } from '@/game/allItems'
import { SeedArray } from '@/game/seed'
import { createStreamableUI } from 'ai/rsc'
import { range, throttle } from 'lodash-es'
import { simulate, SimulationResult } from './simulate'
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
  const allItems = await getAllItems()
  const ui = createStreamableUI(<></>)

  let onUpdate = async (result: SimulationResult) => {
    ui.update(
      <SimulationDisplay
        input={input}
        simulationResult={result}
        allItems={allItems}
      />,
    )
    if (result.done) {
      ui.done()
    }

    // This is to make sure the UI updates:
    const renderCycles = 5
    for (const idx of range(renderCycles)) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  simulate({
    input,
    onUpdate,
  })

  return <div>{ui.value}</div>
}
