import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Metadata } from 'next'
import { SimulationInput } from '../simulation/simulate'

export const metadata: Metadata = {
  title: 'Bot',
}

const baseInput: SimulationInput = {
  noOfBots: 40,
  noOfRepeats: 1,
  simulationSeed: ['lol'],
  startingGold: 40,
  startingItems: ['hero'],
  noOfBotsSelected: 20,
  noOfSelectionRounds: 5,
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  const userId = process.env.BOT_USER_ID
  if (!userId) throw new Error('BOT_USER_ID not set')
  return (
    <>
      <div className="self-center flex flex-col gap-4">
        <ActionButton
          action={async () => {
            'use server'
            return superAction(async () => {})
          }}
        >
          BOT
        </ActionButton>
      </div>
    </>
  )
}
