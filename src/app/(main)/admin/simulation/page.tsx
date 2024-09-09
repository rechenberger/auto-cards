import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { NO_OF_ROUNDS } from '@/game/config'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { SimulationStream } from './SimulationStream'
import { SimulationInput } from './simulate'
import { startingByRound } from './startingByRound'

export const metadata: Metadata = {
  title: 'Simulation',
}

const baseInput: SimulationInput = {
  noOfBots: 20,
  noOfRepeats: 1,
  simulationSeed: ['lol'],
  ...startingByRound(NO_OF_ROUNDS - 1),
  noOfBotsSelected: 10,
  noOfSelectionRounds: 10,
}

const variants = [
  baseInput,
  {
    // startingItems: ['hero', 'woodenSword'],
    simulationSeed: ['rofl'],
  },
  // {
  //   // startingItems: ['hero', 'woodenSword'],
  //   simulationSeed: ['xd'],
  // },
]

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <div className="self-center flex flex-col gap-4">
        <SimpleDataCard data={variants} />
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
                            <SimulationStream
                              input={{ ...baseInput, ...variant }}
                              onUpdateRenderCycles={20}
                            />
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
      </div>
    </>
  )
}
