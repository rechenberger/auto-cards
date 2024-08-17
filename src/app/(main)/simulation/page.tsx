import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { Metadata } from 'next'
import { Fragment } from 'react'
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

const variants = [
  baseProps,
  {
    ...baseProps,
    // startingItems: ['hero', 'woodenSword'],
    simulationSeed: ['rofl'],
  },
  {
    ...baseProps,
    // startingItems: ['hero', 'woodenSword'],
    simulationSeed: ['xd'],
  },
]

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <div className="flex flex-row gap-4 overflow-x-auto">
        {variants.map((variant, idx) => (
          <Fragment key={idx}>
            <div className="flex flex-col gap-4 flex-1 min-w-[45%]">
              <Simulation {...baseProps} />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
