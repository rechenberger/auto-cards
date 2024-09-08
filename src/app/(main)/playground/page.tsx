import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { Button } from '@/components/ui/button'
import { LoadoutData } from '@/db/schema-zod'
import { getAllItems } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import { cloneDeep } from 'lodash-es'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { TinyItem } from '../simulation/TinyItem'
import { PlaygroundMatchView } from './PlaygroundMatchView'

export const metadata: Metadata = {
  title: 'Playground',
}

const decode = (q: string) => {
  return q
    .split('~')
    .map((side) => side.split(','))
    .map((side) =>
      side.map((item) => {
        const [count, name] = item.split(':')
        return {
          name,
          count: Number(count),
        }
      }),
    )
}

const encodePlaygroundQuery = (sides: { name: string; count?: number }[][]) => {
  return sides
    .map((side) =>
      side.map((item) => `${item.count ?? 1}:${item.name}`).join(','),
    )
    .join('~')
}

const playgroundHref = (sides: { name: string; count?: number }[][]) => {
  return `/playground?q=${encodePlaygroundQuery(sides)}`
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string
    seed?: string
    fight?: string
  }
}) {
  await notFoundIfNotAdmin({ allowDev: true })
  let allItems = await getAllItems()
  allItems = await orderItems(allItems)

  const q = searchParams?.q ?? '1:hero~1:hero'
  const seed = searchParams?.seed ?? '1'

  const sides = decode(q)

  const loadouts: LoadoutData[] = sides.map((side) => ({
    items: side.filter((i) => i.count > 0),
  }))

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
              <Link href={`/playground?q=${q}&fight=true`}>Fight</Link>
            </Button>
            <div className="grid grid-cols-2 gap-8">
              {sides.map((side, sideIdx) => {
                return (
                  <Fragment key={sideIdx}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
                      {allItems.map((item) => {
                        const count =
                          side.find((i) => i.name === item.name)?.count ?? 0

                        const minus = cloneDeep(sides)
                        const minusItem = minus[sideIdx]?.find(
                          (i) => i.name === item.name,
                        )
                        if (minusItem && minusItem.count > 0) {
                          minusItem.count--
                        }
                        const minusQuery = encodePlaygroundQuery(minus)
                        const minusHref = `?q=${minusQuery}`

                        const plus = cloneDeep(sides)
                        const plusItem = plus[sideIdx]?.find(
                          (i) => i.name === item.name,
                        )
                        if (plusItem) {
                          plusItem.count++
                        } else {
                          plus[sideIdx].push({ name: item.name, count: 1 })
                        }
                        const plusQuery = encodePlaygroundQuery(plus)
                        const plusHref = `?q=${plusQuery}`

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
