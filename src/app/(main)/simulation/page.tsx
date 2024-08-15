import { StatsDisplay } from '@/components/game/StatsDisplay'
import { calcStats } from '@/game/calcStats'
import { generateMatch } from '@/game/generateMatch'
import { SeedArray } from '@/game/seed'
import { flatten, range, sumBy } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { generateBotsWithItems } from './generateBotsWithItems'

export const metadata: Metadata = {
  title: 'Simulation',
}

const NO_OF_BOTS = 10
const NO_OF_MATCHES = 5

export default async function Page() {
  const simulationSeed: SeedArray = ['lol']

  const bots = await generateBotsWithItems({
    noOfBots: NO_OF_BOTS,
    simulationSeed,
  })

  const botResults = await Promise.all(
    bots.map(async (bot) => {
      const others = bots.filter((b) => b.name !== bot.name)

      const matches = await Promise.all(
        others.map(async (other) => {
          return await Promise.all(
            range(NO_OF_MATCHES).map(async (matchIdx) => {
              const matchReport = await generateMatch({
                participants: [
                  { loadout: bot.game.data.currentLoadout },
                  { loadout: other.game.data.currentLoadout },
                ],
                seed: [...bot.seed, 'match', matchIdx, other.name],
              })

              return matchReport
            }),
          )
        }),
      ).then(flatten)

      const wins = sumBy(matches, (m) => (m.winner.sideIdx === 1 ? 1 : 0))
      const winRate = wins / matches.length

      return {
        ...bot,
        wins,
        winRate,
      }
    }),
  )

  return (
    <>
      <div className="grid grid-cols-[auto,auto,1fr,auto,auto] gap-2 justify-start">
        {botResults.map((bot) => (
          <Fragment key={bot.name}>
            <div>{bot.name}</div>
            <div>{bot.game.data.shopItems.length}</div>
            <div>{bot.game.data.shopItems.map((i) => i.name).join(', ')}</div>
            <div>
              {calcStats({ loadout: bot.game.data.currentLoadout }).then(
                (stats) => (
                  <StatsDisplay stats={stats} />
                ),
              )}
            </div>
            <div>
              {bot.wins} ({Math.round(bot.winRate * 100)}%)
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
