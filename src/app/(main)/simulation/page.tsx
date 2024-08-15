import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAllItems, ItemName } from '@/game/allItems'
import { calcStats } from '@/game/calcStats'
import { SeedArray } from '@/game/seed'
import { orderBy, sum } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'

export const metadata: Metadata = {
  title: 'Simulation',
}

const NO_OF_BOTS = 40
const NO_OF_MATCHES = 1
const simulationSeed: SeedArray = ['lol']
const startingGold = 10
const startingItems: ItemName[] = ['hero']

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })

  const noOfMatchesPerBot = (NO_OF_BOTS - 1) * NO_OF_MATCHES
  const noOfMatches = NO_OF_BOTS * noOfMatchesPerBot
  console.log(`Simulating ${noOfMatches} matches`)

  console.time('generateBotsWithItems')
  const bots = await generateBotsWithItems({
    noOfBots: NO_OF_BOTS,
    simulationSeed,
    startingItems,
    startingGold,
  })
  console.timeEnd('generateBotsWithItems')

  const now = Date.now()
  console.time('simulateBotMatches')
  let botResults = await simulateBotMatches({
    bots,
    noOfMatches: NO_OF_MATCHES,
  })
  console.timeEnd('simulateBotMatches')
  const tookSeconds = ((Date.now() - now) / 1000).toFixed(1)

  botResults = orderBy(botResults, ['winRate'], ['desc'])

  const allItems = await getAllItems()

  return (
    <>
      <SimpleDataCard
        data={{
          NO_OF_BOTS,
          NO_OF_MATCHES,
          noOfMatches,
          tookSeconds,
          simulationSeed,
          startingGold,
          startingItems,
        }}
      />
      <div className="grid grid-cols-[auto,auto,1fr,auto,auto,auto] gap-2 justify-start">
        {botResults.map((bot) => (
          <Fragment key={bot.name}>
            <div>{bot.name}</div>
            <div>{bot.game.data.currentLoadout.items.length}</div>
            <div>
              {bot.game.data.currentLoadout.items.map((i) => i.name).join(', ')}
            </div>
            <div>
              <div className="flex flex-row justify-start">
                {calcStats({ loadout: bot.game.data.currentLoadout }).then(
                  (stats) => (
                    <StatsDisplay stats={stats} />
                  ),
                )}
              </div>
            </div>
            <div>
              {bot.draws} ({Math.round(bot.drawRate * 100)}%)
            </div>
            <div>
              {bot.wins} ({Math.round(bot.winRate * 100)}%)
            </div>
          </Fragment>
        ))}
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Bots</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead>WinRate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems.map((item) => {
              const botsWithItem = botResults.filter((bot) =>
                bot.game.data.currentLoadout.items
                  .map((i) => i.name)
                  .includes(item.name),
              )
              const winRates = botsWithItem.map((bot) => bot.winRate)
              const winRate = sum(winRates) / winRates.length
              return (
                <Fragment key={item.name}>
                  <TableRow>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{botsWithItem.length}</TableCell>
                    <TableCell>
                      {botsWithItem.length * noOfMatchesPerBot}
                    </TableCell>
                    <TableCell>{Math.round(winRate * 100)}%</TableCell>
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
