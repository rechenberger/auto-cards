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
import { getAllItems } from '@/game/allItems'
import { countifyItems } from '@/game/countifyItems'
import { omit, orderBy, sum, sumBy } from 'lodash-es'
import { Fragment } from 'react'
import { SimulationInput } from './Simulation'
import { TinyItem } from './TinyItem'
import { SimulationResult } from './simulate'
import { ItemDefinition } from '@/game/zod-schema'

export const SimulationDisplay = async ({
  input,
  simulationResult,
  allItems,
}: {
  input: SimulationInput
  simulationResult: SimulationResult
  allItems: ItemDefinition[]
}) => {
  const { bots } = simulationResult

  const withoutStartingItems = (items: LoadoutData['items']) => {
    const result = [...items]
    for (const startingItem of input.startingItems) {
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
      <div className="flex flex-col gap-4">
        <SimpleDataCard
          data={{
            ...input,
            ...omit(simulationResult, 'bots'),
            startingItems: input.startingItems.join(', '),
            noOfItems: allItems.length,
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
      </div>
    </>
  )
}
