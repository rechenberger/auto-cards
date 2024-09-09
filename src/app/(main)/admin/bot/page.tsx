import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { TinyItem } from '@/components/game/TinyItem'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Loadout } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { roundStats } from '@/game/roundStats'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { and, eq, isNull } from 'drizzle-orm'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { simulate, SimulationInput } from '../simulation/simulate'
import { SimulationDisplay } from '../simulation/SimulationDisplay'
import { startingByRound } from '../simulation/startingByRound'

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
      gold: startingByRound(roundNo).startingGold,
    }
  })

  const generateRoundBots = async ({ roundNo }: { roundNo: number }) => {
    'use server'
    const input = {
      ...baseInput,
      ...startingByRound(roundNo),
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
    await db
      .delete(schema.loadout)
      .where(
        and(isNull(schema.loadout.userId), eq(schema.loadout.roundNo, roundNo)),
      )
      .execute()
    await db.insert(schema.loadout).values(
      simulationResult.bots.map((bot) => ({
        roundNo,
        data: {
          ...bot.game.data.currentLoadout,
          items: countifyItems(bot.game.data.currentLoadout.items),
        },
      })),
    )
    streamRevalidatePath('/bot')
  }

  return (
    <>
      <ActionButton
        askForConfirmation
        action={async () => {
          'use server'
          return superAction(async () => {
            for (const round of roundStats) {
              await generateRoundBots({ roundNo: round.roundNo })
            }
          })
        }}
      >
        Generate All
      </ActionButton>
      <Table>
        <TableHeader>
          <TableHead>Round</TableHead>
          <TableHead>Gold</TableHead>
          <TableHead>Loadouts</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {rounds.map((round) => (
            <Fragment key={round.roundNo}>
              <TableRow>
                <TableCell>{round.roundNo}</TableCell>
                <TableCell>{round.gold}</TableCell>
                <TableCell className="flex flex-col gap-1">
                  {round.loadouts.map((loadout) => (
                    <Fragment key={loadout.id}>
                      <div className="flex flex-row gap-1">
                        {countifyItems(loadout.data.items).map((i) => (
                          <Fragment key={i.name}>
                            <TinyItem name={i.name} count={i.count} />
                          </Fragment>
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </TableCell>
                <TableCell>
                  <ActionButton
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        return generateRoundBots({ roundNo: round.roundNo })
                      })
                    }}
                  >
                    Generate
                  </ActionButton>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
      <div className="self-center flex flex-col gap-4"></div>
    </>
  )
}
