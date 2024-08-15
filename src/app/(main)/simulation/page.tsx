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
import { countifyItems } from '@/game/countifyItems'
import { SeedArray } from '@/game/seed'
import { capitalCase } from 'change-case'
import { orderBy, sum, sumBy } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'

export const metadata: Metadata = {
  title: 'Simulation',
}

const noOfBots = 40
const noOfRepeats = 1
const simulationSeed: SeedArray = ['lol']
const startingGold = 10
const startingItems: ItemName[] = ['hero']

export default async function Page() {
  await throwIfNotAdmin({ allowDev: true })

  const noOfMatchesPerBot = (noOfBots - 1) * noOfRepeats
  const noOfMatches = noOfBots * noOfMatchesPerBot
  console.log(`Simulating ${noOfMatches} matches`)

  console.time('generateBotsWithItems')
  const bots = await generateBotsWithItems({
    noOfBots,
    simulationSeed,
    startingItems,
    startingGold,
  })
  console.timeEnd('generateBotsWithItems')

  const now = Date.now()
  console.time('simulateBotMatches')
  let botResults = await simulateBotMatches({
    bots,
    noOfRepeats,
  })
  console.timeEnd('simulateBotMatches')
  const tookSeconds = ((Date.now() - now) / 1000).toFixed(1)

  botResults = orderBy(botResults, (bot) => bot.wins / bot.matches, ['desc'])

  const allItems = await getAllItems()

  let itemStats = allItems.map((item) => {
    const botsWithItem = botResults.filter((bot) =>
      bot.game.data.currentLoadout.items.map((i) => i.name).includes(item.name),
    )
    const winRates = botsWithItem.map((bot) => bot.wins / bot.matches)
    const winRate = sum(winRates) / winRates.length
    const matches = sumBy(botsWithItem, (bot) => bot.matches)
    return {
      ...item,
      botsWithItem,
      winRate,
      matches,
    }
  })
  itemStats = orderBy(itemStats, (item) => item.winRate, ['desc'])

  return (
    <>
      <SimpleDataCard
        data={{
          noOfBots,
          noOfRepeats,
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
              {countifyItems(bot.game.data.currentLoadout.items)
                .map(
                  (i) =>
                    `${i.count > 1 ? `${i.count}x ` : ''}${capitalCase(i.name)}`,
                )
                .join(', ')}
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
              {bot.draws} ({Math.round((bot.draws / bot.matches) * 100)}%)
            </div>
            <div>
              {bot.wins} ({Math.round((bot.wins / bot.matches) * 100)}%)
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
            {itemStats.map((item) => {
              return (
                <Fragment key={item.name}>
                  <TableRow>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.botsWithItem.length}</TableCell>
                    <TableCell>{item.matches}</TableCell>
                    <TableCell>{Math.round(item.winRate * 100)}%</TableCell>
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
