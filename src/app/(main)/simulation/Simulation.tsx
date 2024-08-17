import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadoutData } from '@/db/schema-zod'
import { getAllItems, ItemName } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { SeedArray } from '@/game/seed'
import { orderBy, range, sum, sumBy, take, uniqBy } from 'lodash-es'
import { Fragment } from 'react'
import { BotGame, generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'
import { TinyItem } from './TinyItem'

export type SimulationProps = {
  noOfBots: number
  noOfRepeats: number
  simulationSeed: SeedArray
  startingGold: number
  startingItems: ItemName[]
  noOfBotsSelected: number
  noOfSelectionRounds: number
}

export async function Simulation({
  noOfBots,
  noOfRepeats,
  simulationSeed,
  startingGold,
  startingItems,
  noOfBotsSelected,
  noOfSelectionRounds,
}: SimulationProps) {
  const noOfMatchesPerBot = (noOfBots - 1) * noOfRepeats
  const noOfMatches = noOfBots * noOfMatchesPerBot
  console.log(`Simulating ${noOfMatches} matches`)

  let bots: BotGame[] = []

  const startTime = Date.now()
  for (const selectionRound of range(noOfSelectionRounds + 1)) {
    const isFinal = selectionRound === noOfSelectionRounds

    if (!isFinal) {
      console.time('generateBotsWithItems')
      let t = 0
      while (bots.length < noOfBots) {
        t++
        bots.push(
          ...(await generateBotsWithItems({
            noOfBots: noOfBots - bots.length,
            simulationSeed: [...simulationSeed, selectionRound, t],
            startingItems,
            startingGold,
          })),
        )
        bots = uniqBy(bots, (bot) =>
          orderBy(bot.game.data.currentLoadout.items, (i) => i.name)
            .map((i) => i.name)
            .join(','),
        )
      }
      console.timeEnd('generateBotsWithItems')
    }

    console.time('simulateBotMatches')
    await simulateBotMatches({
      bots,
      noOfRepeats,
    })
    console.timeEnd('simulateBotMatches')

    bots = orderBy(bots, (bot) => bot.wins / bot.matches, ['desc'])

    if (!isFinal) {
      bots = take(bots, noOfBotsSelected)
      for (const bot of bots) {
        bot.wins = 0
        bot.draws = 0
        bot.matches = 0
        bot.time = 0
        bot.simulationRounds++
      }
    }
  }

  const tookSeconds = ((Date.now() - startTime) / 1000).toFixed(1)

  const allItems = await getAllItems()

  const withoutStartingItems = (items: LoadoutData['items']) => {
    const result = [...items]
    for (const startingItem of startingItems) {
      const idx = result.findIndex((i) => i.name === startingItem)
      if (idx !== -1) {
        result.splice(idx, 1)
      }
    }
    return result
  }

  let itemStats = allItems
    .filter((item) => item.price > 0)
    .map((item) => {
      const botsWithItem = bots.filter((bot) =>
        withoutStartingItems(bot.game.data.currentLoadout.items)
          .map((i) => i.name)
          .includes(item.name),
      )
      const winRates = botsWithItem.map((bot) => bot.wins / bot.matches)
      const winRate = sum(winRates) / winRates.length
      const matches = sumBy(botsWithItem, (bot) => bot.matches)
      const simulationRounds = sumBy(
        botsWithItem,
        (bot) => bot.simulationRounds,
      )
      return {
        ...item,
        botsWithItem,
        winRate,
        matches,
        simulationRounds,
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
          startingItems: startingItems.join(', '),
          noOfItems: allItems.length,
          noOfBotsSelected,
          noOfSelectionRounds,
          simulatedTime: `${(
            sumBy(bots, (bot) => bot.time) /
            1000 /
            60 /
            60 /
            2
          ).toFixed(1)} hours`,
        }}
      />
      <div className="grid grid-cols-[1fr,auto,auto] gap-2 justify-start">
        {bots.map((bot, idx) => (
          <Fragment key={idx}>
            <div className="flex flex-row gap-1 overflow-hidden">
              {countifyItems(
                withoutStartingItems(bot.game.data.currentLoadout.items),
              ).map((i) => (
                <Fragment key={i.name}>
                  <TinyItem name={i.name} count={i.count} />
                </Fragment>
              ))}
            </div>
            {/* <div>
              <div className="flex flex-row justify-start">
                {calcStats({ loadout: bot.game.data.currentLoadout }).then(
                  (stats) => (
                    <StatsDisplay stats={stats} showZero />
                  ),
                )}
              </div>
            </div> */}
            {/* <div>{bot.simulationRounds}</div> */}
            <div className="w-max">
              {(bot.time / 1000 / bot.matches).toFixed(1)}s
            </div>
            {/* <div>
              {bot.draws} ({Math.round((bot.draws / bot.matches) * 100)}%)
            </div> */}
            <div className="w-max">
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
              <TableHead>Rounds</TableHead>
              {/* <TableHead>Matches</TableHead> */}
              <TableHead>WinRate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemStats.map((item) => {
              return (
                <Fragment key={item.name}>
                  <TableRow>
                    <TableCell className="flex flex-row">
                      <TinyItem name={item.name} />
                    </TableCell>
                    <TableCell>{item.botsWithItem.length}</TableCell>
                    <TableCell>{item.simulationRounds}</TableCell>
                    {/* <TableCell>{item.matches}</TableCell> */}
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
