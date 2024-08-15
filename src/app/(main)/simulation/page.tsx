import { StatsDisplay } from '@/components/game/StatsDisplay'
import { calcStats } from '@/game/calcStats'
import { SeedArray } from '@/game/seed'
import { Metadata } from 'next'
import { Fragment } from 'react'
import { generateBotsWithItems } from './generateBotsWithItems'

export const metadata: Metadata = {
  title: 'Simulation',
}

export default async function Page() {
  const simulationSeed: SeedArray = ['lol']

  const noOfBots = 10

  const bots = await generateBotsWithItems({
    noOfBots,
    simulationSeed,
  })

  return (
    <>
      <div className="grid grid-cols-[auto,auto,1fr,auto] gap-2 justify-start">
        {bots.map((bot) => (
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
          </Fragment>
        ))}
      </div>
    </>
  )
}
