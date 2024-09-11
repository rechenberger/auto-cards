import { StatsDisplay } from '@/components/game/StatsDisplay'
import { TinyItem } from '@/components/game/TinyItem'
import { Button } from '@/components/ui/button'
import { LoadoutData } from '@/db/schema-zod'
import { getAllItems, getItemByName } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { negativeItems, sumItems } from '@/game/sumItems'
import { cn } from '@/lib/utils'
import { sum } from 'lodash-es'
import Link from 'next/link'
import { Fragment } from 'react'
import { playgroundHref, PlaygroundOptions } from './playgroundHref'

const loadoutPrice = async (loadout: LoadoutData) => {
  const prices = await Promise.all(
    loadout.items.map(async (item) => {
      const def = await getItemByName(item.name)
      return def.price * (item.count ?? 1)
    }),
  )
  return sum(prices)
}

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
                  <div>
                    {loadoutPrice(loadout).then((gold) => (
                      <StatsDisplay stats={{ gold }} />
                    ))}
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
                              <TinyItem name={item.name} count={count} />
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
