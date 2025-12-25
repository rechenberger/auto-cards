import { getAllItems } from '@/game/allItems'
import { createStreamableUI } from '@/lib/streamableUI'
import { range } from 'lodash-es'
import { simulate, SimulationInput, SimulationResult } from './simulate'
import { SimulationDisplay } from './SimulationDisplay'

export async function SimulationStream({
  input,
  onUpdateThrottleMs = 200,
  onUpdateRenderCycles = 10,
}: {
  input: SimulationInput
  onUpdateThrottleMs?: number
  onUpdateRenderCycles?: number
}) {
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
    for (const idx of range(onUpdateRenderCycles)) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  simulate({
    input,
    onUpdate,
    onUpdateThrottleMs,
  })

  return <div>{ui.value}</div>
}
