import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { Simulation, SimulationInput } from './Simulation'

export const metadata: Metadata = {
  title: 'Simulation',
}

const baseInput: SimulationInput = {
  noOfBots: 10,
  noOfRepeats: 1,
  simulationSeed: ['lol'],
  startingGold: 20,
  startingItems: ['hero'],
  noOfBotsSelected: 5,
  noOfSelectionRounds: 100,
}

const variants = [
  baseInput,
  {
    ...baseInput,
    // startingItems: ['hero', 'woodenSword'],
    simulationSeed: ['rofl'],
  },
  {
    ...baseInput,
    // startingItems: ['hero', 'woodenSword'],
    simulationSeed: ['xd'],
  },
]

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Simulate',
              className: 'max-w-none',
              content: (
                <>
                  <div className="flex flex-row gap-4 overflow-x-auto">
                    {variants.map((variant, idx) => (
                      <Fragment key={idx}>
                        <div className="flex flex-col gap-4 flex-1 min-w-[45%]">
                          <Simulation input={variant} />
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </>
              ),
            })
          })
        }}
      >
        Simulate
      </ActionButton>
    </>
  )
}
