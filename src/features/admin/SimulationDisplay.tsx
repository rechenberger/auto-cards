'use client'

import { PlaygroundSelector } from '@/components/game/PlaygroundSelector'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimulationInputDto, SimulationResultDto } from '@/contracts/admin'
import { ItemDefinition } from '@/game/ItemDefinition'
import { LoadoutData } from '@/game/LoadoutData'
import { countifyItems } from '@/game/countifyItems'
import { capitalCase } from 'change-case'
import { cloneDeep, omit, orderBy, sum, sumBy } from 'lodash-es'

export const SimulationDisplay = ({
  input,
  simulationResult,
  allItems,
  showDraws = false,
}: {
  input: SimulationInputDto
  simulationResult: SimulationResultDto
  allItems: ItemDefinition[]
  showDraws?: boolean
}) => {
  const { bots } = simulationResult

  const withoutStartingItems = (items: LoadoutData['items']) => {
    const result = cloneDeep(items)
    for (const startingItem of input.startingItems) {
      const idx = result.findIndex((item) => item.name === startingItem)
      const item = result[idx]
      if (!item) continue
      if ((item.count ?? 1) > 1) item.count = (item.count ?? 1) - 1
      else result.splice(idx, 1)
    }
    return result
  }

  const itemStats = orderBy(
    allItems
      .filter((item) => item.price > 0)
      .map((item) => {
        const botsWithItem = bots.filter((bot) =>
          withoutStartingItems(bot.loadout.items).some(
            (candidate) => candidate.name === item.name,
          ),
        )
        const totalAmount = sum(
          botsWithItem.flatMap((bot) =>
            withoutStartingItems(bot.loadout.items)
              .filter((candidate) => candidate.name === item.name)
              .map((candidate) => candidate.count ?? 1),
          ),
        )
        const rates = botsWithItem
          .filter((bot) => bot.matches > 0)
          .map((bot) => bot.wins / bot.matches)
        return {
          name: item.name,
          botCount: botsWithItem.length,
          totalAmount,
          simulationRounds: sumBy(botsWithItem, (bot) => bot.simulationRounds),
          winRate: rates.length ? sum(rates) / rates.length : undefined,
        }
      }),
    [(item) => item.simulationRounds, (item) => item.winRate ?? 0],
    ['desc', 'desc'],
  )

  return (
    <div className="flex flex-col gap-4">
      <Progress
        value={
          input.noOfSelectionRounds
            ? (100 * simulationResult.selectionRound) /
              input.noOfSelectionRounds
            : 100
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
            1_000 /
            60 /
            60 /
            2
          ).toFixed(1)} hours`,
        }}
      />
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Playground</TableHead>
              <TableHead>Loadout</TableHead>
              <TableHead title="Selection rounds survived">Age</TableHead>
              <TableHead title="Average match time">ØTime</TableHead>
              {showDraws && <TableHead>Draws</TableHead>}
              <TableHead>Wins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.map((bot, index) => (
              <TableRow key={`${bot.name}-${index}`}>
                <TableCell>
                  <PlaygroundSelector loadout={bot.loadout} />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-80 flex-wrap gap-1">
                    {countifyItems(withoutStartingItems(bot.loadout.items)).map(
                      (item) => (
                        <Badge key={item.name} variant="secondary">
                          {(item.count ?? 1) > 1 ? `${item.count}× ` : ''}
                          {capitalCase(item.name)}
                        </Badge>
                      ),
                    )}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {bot.simulationRounds}
                </TableCell>
                <TableCell className="tabular-nums">
                  {bot.matches
                    ? (bot.time / 1_000 / bot.matches).toFixed(1)
                    : 0}
                  s
                </TableCell>
                {showDraws && (
                  <TableCell className="tabular-nums">
                    {bot.draws} (
                    {bot.matches
                      ? Math.round((bot.draws / bot.matches) * 100)
                      : 0}
                    %)
                  </TableCell>
                )}
                <TableCell className="tabular-nums">
                  {bot.wins} (
                  {bot.matches ? Math.round((bot.wins / bot.matches) * 100) : 0}
                  %)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Bots</TableHead>
              <TableHead>∑Amount</TableHead>
              <TableHead>∑Age</TableHead>
              <TableHead>Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemStats.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{capitalCase(item.name)}</TableCell>
                <TableCell className="tabular-nums">
                  {item.botCount} (
                  {bots.length
                    ? Math.round((100 * item.botCount) / bots.length)
                    : 0}
                  %)
                </TableCell>
                <TableCell className="tabular-nums">
                  {item.totalAmount}
                </TableCell>
                <TableCell className="tabular-nums">
                  {item.simulationRounds}
                </TableCell>
                <TableCell className="tabular-nums">
                  {item.winRate === undefined
                    ? '–'
                    : `${Math.round(item.winRate * 100)}%`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
