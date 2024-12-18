import { LeaderboardBenchmarkButton } from '@/components/game/LeaderboardBenchmarkButton'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { TinyItem } from '@/components/game/TinyItem'
import { Button } from '@/components/ui/button'
import { getAllItems } from '@/game/allItems'
import { calcLoadoutPrice } from '@/game/calcLoadoutPrice'
import { GAME_VERSION, NO_OF_ROUNDS } from '@/game/config'
import { DefaultGameMode } from '@/game/gameMode'
import { orderItems } from '@/game/orderItems'
import { negativeItems, sumItems } from '@/game/sumItems'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Fragment } from 'react'
import { PlaygroundOptions, playgroundHref } from './playgroundHref'

export const PlaygroundEdit = async ({
  options,
}: {
  options: PlaygroundOptions
}) => {
  let allItems = await getAllItems()
  allItems = await orderItems(allItems)
  const loadouts = options.loadouts
  return (
    <>
      <div className="flex flex-col gap-4 self-center">
        <div className="grid grid-cols-2 gap-8">
          {loadouts.map((loadout, sideIdx) => {
            return (
              <Fragment key={sideIdx}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row justify-between">
                    {calcLoadoutPrice(loadout).then((gold) => (
                      <StatsDisplay stats={{ gold }} showZero />
                    ))}
                    <LeaderboardBenchmarkButton
                      loadout={{
                        id: 'fake',
                        data: loadout,
                        createdAt: new Date().toISOString(),
                        userId: 'fake',
                        updatedAt: new Date().toISOString(),
                        gameId: null,
                        roundNo: NO_OF_ROUNDS - 1,
                        primaryMatchParticipationId: null,
                        version: GAME_VERSION,
                        gameMode: DefaultGameMode,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {allItems.map((item) => {
                      const count =
                        loadout.items.find((i) => i.name === item.name)
                          ?.count ?? 0

                      const minusItems =
                        count > 0
                          ? sumItems(
                              loadout.items,
                              negativeItems([{ name: item.name, count: 1 }]),
                            )
                          : loadout.items
                      const minusLoadouts = [...loadouts]
                      minusLoadouts[sideIdx] = { items: minusItems }
                      const minusHref = playgroundHref({
                        ...options,
                        loadouts: minusLoadouts,
                      })

                      const plusItems = sumItems(loadout.items, [
                        { name: item.name, count: 1 },
                      ])
                      const plusLoadouts = [...loadouts]
                      plusLoadouts[sideIdx] = { items: plusItems }
                      const plusHref = playgroundHref({
                        ...options,
                        loadouts: plusLoadouts,
                      })

                      return (
                        <Fragment key={item.name}>
                          <div className="flex flex-row gap-1 items-center group">
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className={cn(count <= 0 && 'invisible')}
                            >
                              <Link
                                className="text-center font-bold py-1"
                                href={minusHref}
                              >
                                -
                              </Link>
                            </Button>
                            <div
                              className={cn(
                                count <= 0 &&
                                  'opacity-20 group-hover:opacity-100',
                                'flex flex-col',
                                'flex-1',
                              )}
                            >
                              <TinyItem itemData={{ name: item.name, count }} />
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <Link
                                className="text-center font-bold py-1"
                                href={plusHref}
                              >
                                +
                              </Link>
                            </Button>
                          </div>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
