import { StatsDisplay } from '@/components/game/StatsDisplay'
import { calcStats } from '@/game/calcStats'
import { SeedArray } from '@/game/seed'
import { orderBy } from 'lodash-es'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { generateBotsWithItems } from './generateBotsWithItems'
import { simulateBotMatches } from './simulateBotMatches'

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

  console.time('simulateBotMatches')
  let botResults = await simulateBotMatches({
    bots,
    noOfMatches: NO_OF_MATCHES,
  })
  console.timeEnd('simulateBotMatches')

  botResults = orderBy(botResults, ['winRate'], ['desc'])

  return (
    <>
      <div className="grid grid-cols-[auto,auto,1fr,auto,auto,auto] gap-2 justify-start">
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
              {bot.draws} ({Math.round(bot.drawRate * 100)}%)
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
