import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Card } from '@/components/ui/card'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { roundStats } from '@/game/roundStats'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { isNull } from 'drizzle-orm'
import { sumBy } from 'lodash-es'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { Fragment } from 'react'
import { simulate, SimulationInput } from '../simulation/simulate'
import { SimulationDisplay } from '../simulation/SimulationDisplay'

export const metadata: Metadata = {
  title: 'Bot',
}

const baseInput: SimulationInput = {
  noOfBots: 10,
  noOfRepeats: 1,
  simulationSeed: ['bot'],
  startingGold: 0,
  startingItems: ['hero'],
  noOfBotsSelected: 5,
  noOfSelectionRounds: 5,
}

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })
  // const userId = process.env.BOT_USER_ID
  // if (!userId) throw new Error('BOT_USER_ID not set')

  const allLoadouts = await db.query.loadout
    .findMany({
      where: isNull(schema.loadout.userId),
    })
    .then(Loadout.array().parse)

  const rounds = roundStats.map(({ roundNo }) => {
    const loadouts = allLoadouts.filter((r) => r.roundNo === roundNo)
    return {
      roundNo,
      loadouts,
      gold: startingGoldByRound(roundNo),
    }
  })

  const generateRoundBots = async ({ roundNo }: { roundNo: number }) => {
    'use server'
    return superAction(async () => {
      const input = {
        ...baseInput,
        startingGold: startingGoldByRound(roundNo),
      }
      const simulationResult = await simulate({
        input,
      })
      if (!simulationResult) return
      streamDialog({
        title: `Round ${roundNo}`,
        content: (
          <div>
            <SimulationDisplay
              input={input}
              simulationResult={simulationResult}
              allItems={[]}
            />
          </div>
        ),
      })
      await db.insert(schema.loadout).values(
        simulationResult.bots.map((bot) => ({
          roundNo,
          data: bot.game.data.currentLoadout,
        })),
      )
      revalidatePath('/bot')
    })
  }

  return (
    <>
      {/* <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {})
        }}
      >
        BOT
      </ActionButton> */}
      <div className="self-center flex flex-col gap-4">
        {rounds.map((round) => (
          <Fragment key={round.roundNo}>
            <Card className="p-2">
              <SimpleDataCard data={round} />
              <ActionButton
                action={async () => {
                  'use server'
                  return generateRoundBots({ roundNo: round.roundNo })
                }}
              >
                Generate
              </ActionButton>
            </Card>
          </Fragment>
        ))}
      </div>
    </>
  )
}

const startingGoldByRound = (roundNo: number) => {
  return sumBy(
    roundStats.filter((r) => r.roundNo <= roundNo),
    'gold',
  )
}
