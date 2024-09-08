import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { Button } from '@/components/ui/button'
import { getAllItems } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { negativeItems, sumItems } from '@/game/sumItems'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { TinyItem } from '../simulation/TinyItem'
import { PlaygroundMatchView } from './PlaygroundMatchView'
import { decodeLoadouts, encodeLoadouts } from './playgroundHref'

export const metadata: Metadata = {
  title: 'Playground',
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    loadouts?: string
    seed?: string
    fight?: string
  }
}) {
  await notFoundIfNotAdmin({ allowDev: true })
  let allItems = await getAllItems()
  allItems = await orderItems(allItems)

  const seed = searchParams?.seed ?? '1'

  const loadouts = decodeLoadouts(searchParams?.loadouts ?? '1:hero~1:hero')

  console.log(JSON.stringify(loadouts, null, 2))

  const mode = !!searchParams?.fight ? 'fight' : 'edit'

  return (
    <>
      {mode === 'edit' && (
        <>
          <div className="flex flex-col gap-4 self-center">
            {/* <ActionButton
              catchToast
              className="mb-8"
              action={async () => {
                'use server'
                return superAction(async () => {
                  const sides = decode(q)
                  if (sides.length !== 2) {
                    throw new Error('Must have exactly 2 sides')
                  }
                  const matchReport = await generateMatch({
                    seed: [seed],
                    participants: sides.map((side) => ({
                      loadout: {
                        items: side,
                      },
                    })),
                  })

                  streamDialog({
                    title: 'Match Report',
                    content: (
                      <>
                        <div className="overflow-auto max-h-[calc(100vh-240px)] max-sm:-mx-6">
                          <MatchReportDisplay matchReport={matchReport} />
                        </div>
                      </>
                    ),
                  })
                })
              }}
            >
              Fight
            </ActionButton> */}
            <Button asChild>
              <Link
                href={`/playground?loadouts=${searchParams?.loadouts}&fight=true`}
              >
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
                        const minusQuery = encodeLoadouts(minusLoadouts)
                        const minusHref = `?loadouts=${minusQuery}`

                        const plusItems = sumItems(loadout.items, [
                          { name: item.name, count: 1 },
                        ])
                        const plusLoadouts = [...loadouts]
                        plusLoadouts[sideIdx] = { items: plusItems }
                        const plusQuery = encodeLoadouts(plusLoadouts)
                        const plusHref = `?loadouts=${plusQuery}`

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
      )}
      {mode === 'fight' && <PlaygroundMatchView loadouts={loadouts} />}
    </>
  )
}
