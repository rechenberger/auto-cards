import { StatsDisplay } from '@/components/game/StatsDisplay'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'
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

const NO_OF_BOTS = 20
const NO_OF_MATCHES = 5

export default async function Page() {
  const simulationSeed: SeedArray = ['lol']

  const noOfMatches = NO_OF_BOTS * (NO_OF_BOTS - 1) * NO_OF_MATCHES
  console.log(`Simulating ${noOfMatches} matches`)

  const bots = await generateBotsWithItems({
    noOfBots: NO_OF_BOTS,
    simulationSeed,
  })

  const now = Date.now()
  console.time('simulateBotMatches')
  let botResults = await simulateBotMatches({
    bots,
    noOfMatches: NO_OF_MATCHES,
  })
  console.timeEnd('simulateBotMatches')
  const tookSeconds = ((Date.now() - now) / 1000).toFixed(1)

  botResults = orderBy(botResults, ['winRate'], ['desc'])

  return (
    <>
      <SimpleDataCard
        data={{
          NO_OF_BOTS,
          NO_OF_MATCHES,
          noOfMatches,
          tookSeconds,
        }}
      />
      <div className="grid grid-cols-[auto,auto,1fr,auto,auto,auto] gap-2 justify-start">
        {botResults.map((bot) => (
          <Fragment key={bot.name}>
            <div>{bot.name}</div>
            <div>{bot.game.data.shopItems.length}</div>
            <div>{bot.game.data.shopItems.map((i) => i.name).join(', ')}</div>
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
    </>
  )
}
