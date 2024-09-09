import { PlaygroundSelector } from '@/components/game/PlaygroundSelector'
import { TinyItem } from '@/components/game/TinyItem'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadoutData } from '@/db/schema-zod'
import { countifyItems } from '@/game/countifyItems'
import { ItemDefinition } from '@/game/ItemDefinition'
import { cloneDeep, omit, orderBy, sum, sumBy } from 'lodash-es'
import { Fragment } from 'react'
import { SimulationInput, SimulationResult } from './simulate'

export const SimulationDisplay = async ({
  input,
  simulationResult,
  allItems,
  showDraws = false,
}: {
  input: SimulationInput
  simulationResult: SimulationResult
  allItems: ItemDefinition[]
  showDraws?: boolean
}) => {
  const { bots } = simulationResult

  const withoutStartingItems = (items: LoadoutData['items']) => {
    const result = cloneDeep(items)
    for (const startingItem of input.startingItems) {
      const idx = result.findIndex((i) => i.name === startingItem)
      if (idx !== -1) {
        const item = result[idx]
        if (item && item.count && item.count > 1) {
          item.count -= 1
        } else {
          result.splice(idx, 1)
        }
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
      const totalAmount = sum(
        botsWithItem.flatMap((bot) =>
          withoutStartingItems(bot.game.data.currentLoadout.items)
            .filter((i) => i.name === item.name)
            .map((i) => i.count ?? 1),
        ),
      )
      const winRates = botsWithItem.map((bot) => bot.wins / bot.matches)
      const winRate = winRates.length
        ? sum(winRates) / winRates.length
        : undefined
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
        totalAmount,
      }
    })
  itemStats = orderBy(itemStats, (item) => item.winRate ?? 0, ['desc'])
  itemStats = orderBy(itemStats, (item) => item.simulationRounds, ['desc'])

  return (
    <>
      <div className="flex flex-col gap-4">
        <Progress
          value={
            (100 * simulationResult.selectionRound) / input.noOfSelectionRounds
          }
        />
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Playground</TableHead>
              <TableHead>Loadout</TableHead>
              <TableHead title="Selection rounds survived">Age</TableHead>
              <TableHead title="average match time">ØTime</TableHead>
              {showDraws && <TableHead>Draws</TableHead>}
              <TableHead>Wins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.map((bot, idx) => (
              <Fragment key={idx}>
                <TableRow>
                  <TableCell>
                    <PlaygroundSelector
                      loadout={bot.game.data.currentLoadout}
                    />
                  </TableCell>
                  <TableCell className="flex flex-row gap-1 overflow-hidden">
                    {countifyItems(
                      withoutStartingItems(bot.game.data.currentLoadout.items),
                    ).map((i) => (
                      <Fragment key={i.name}>
                        <TinyItem name={i.name} count={i.count} />
                      </Fragment>
                    ))}
                  </TableCell>
                  <TableCell>{bot.simulationRounds}</TableCell>
                  <TableCell className="w-max">
                    {(bot.time / 1000 / bot.matches).toFixed(1)}s
                  </TableCell>
                  {showDraws && (
                    <TableCell>
                      {bot.draws}&nbsp;(
                      {Math.round((bot.draws / bot.matches) * 100)}%)
                    </TableCell>
                  )}
                  <TableCell className="w-max">
                    {bot.wins}&nbsp;(
                    {Math.round((bot.wins / bot.matches) * 100)}%)
                    {/* </Link> */}
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Bots</TableHead>
              <TableHead>∑Amount</TableHead>
              <TableHead>∑Age</TableHead>
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
                    <TableCell>
                      {item.botsWithItem.length}&nbsp;(
                      {Math.round(
                        (100 * item.botsWithItem.length) / bots.length,
                      )}
                      %)
                    </TableCell>
                    <TableCell>{item.totalAmount}</TableCell>
                    <TableCell>{item.simulationRounds}</TableCell>
                    {/* <TableCell>{item.matches}</TableCell> */}
                    <TableCell>
                      {item.winRate === undefined
                        ? '-'
                        : `${Math.round(item.winRate * 100)}%`}
                    </TableCell>
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
