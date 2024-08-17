import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { Metadata } from 'next'
import { Simulation, SimulationProps } from './Simulation'

export const metadata: Metadata = {
  title: 'Simulation',
}

const baseProps: SimulationProps = {
  noOfBots: 40,
  noOfRepeats: 1,
  simulationSeed: ['lol'],
  startingGold: 20,
  startingItems: ['hero'],
  noOfBotsSelected: 20,
  noOfSelectionRounds: 5,
}

const variantProps: SimulationProps = {
  ...baseProps,
  startingItems: ['hero', 'woodenSword'],
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Simulation {...baseProps} />
        </div>
        <div className="flex flex-col gap-4">
          <Simulation {...variantProps} />
        </div>
      </div>
    </>
  )
}
