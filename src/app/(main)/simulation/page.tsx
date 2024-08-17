import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { ItemName } from '@/game/allItems'
import { SeedArray } from '@/game/seed'
import { Metadata } from 'next'
import { Simulation } from './Simulation'

export const metadata: Metadata = {
  title: 'Simulation',
}

const noOfBots = 40
const noOfRepeats = 1
const simulationSeed: SeedArray = ['lol']
const startingGold = 20
const startingItems: ItemName[] = ['hero']
const noOfBotsSelected = 20
const noOfSelectionRounds = 5

const props = {
  noOfBots,
  noOfRepeats,
  simulationSeed,
  startingGold,
  startingItems,
  noOfBotsSelected,
  noOfSelectionRounds,
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Simulation {...props} simulationSeed={[0]} />
        </div>
        <div className="flex flex-col gap-4">
          <Simulation {...props} simulationSeed={[1]} />
        </div>
      </div>
    </>
  )
}
