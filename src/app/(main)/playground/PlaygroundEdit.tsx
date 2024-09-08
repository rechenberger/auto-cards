import { Button } from '@/components/ui/button'
import { getAllItems } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { negativeItems, sumItems } from '@/game/sumItems'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Fragment } from 'react'
import { TinyItem } from '../simulation/TinyItem'
import { playgroundHref, PlaygroundOptions } from './playgroundHref'

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
        <Button asChild>
          <Link href={playgroundHref({ ...options, mode: 'fight' })}>
            Fight
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-8">
          {loadouts.map((loadout, sideIdx) => {
            return (
              <Fragment key={sideIdx}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
                  {allItems.map((item) => {
                    const count =
                      loadout.items.find((i) => i.name === item.name)?.count ??
                      0

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
                        <div
                          className={cn(
                            // count <= 0 && 'grayscale',
                            'flex flex-col',
                          )}
                        >
                          <TinyItem name={item.name} />
                        </div>
                        <div className="flex flex-row gap-1 mb-4 items-center">
                          {count >= 1 && (
                            <>
                              <Link
                                className="flex-1 text-center font-bold py-1"
                                href={minusHref}
                              >
                                -
                              </Link>
                              <div>{count}</div>
                            </>
                          )}
                          <Link
                            className="flex-1 text-center font-bold py-1"
                            href={plusHref}
                          >
                            +
                          </Link>
                        </div>
                      </Fragment>
                    )
                  })}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
