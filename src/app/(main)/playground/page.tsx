import { notFoundIfNotAdmin } from '@/auth/getIsAdmin'
import { MatchReportDisplay } from '@/components/game/MatchReportDisplay'
import { getAllItems } from '@/game/allItems'
import { generateMatch } from '@/game/generateMatch'
import { orderItems } from '@/game/orderItems'
import { cn } from '@/lib/utils'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { cloneDeep, range } from 'lodash-es'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { TinyItem } from '../simulation/TinyItem'

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

const encode = (sides: { name: string; count: number }[][]) => {
  return sides
    .map((side) => side.map((item) => `${item.count}:${item.name}`).join(','))
    .join('~')
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string
    seed?: string
  }
}) {
  await notFoundIfNotAdmin({ allowDev: true })
  let allItems = await getAllItems()
  allItems = await orderItems(allItems)

  const q = searchParams?.q ?? '1:hero~1:hero'
  const seed = searchParams?.seed ?? '1'

  const sides = decode(q)

  return (
    <>
      <div className="flex flex-row gap-8">
        {sides.map((side, sideIdx) => {
          return (
            <Fragment key={sideIdx}>
              <div className="flex flex-col gap-1">
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
                  const minusQuery = encode(minus)
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
                  const plusQuery = encode(plus)
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
                      <div className="flex flex-row gap-1 mb-4 self-center">
                        {count >= 1 && (
                          <>
                            <Link href={minusHref}>-</Link>
                            <div>{count}</div>
                          </>
                        )}
                        <Link href={plusHref}>+</Link>
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            </Fragment>
          )
        })}
        <ActionButton
          catchToast
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
                    items: side.flatMap((item) =>
                      range(item.count).map(() => ({ name: item.name })),
                    ),
                  },
                })),
              })

              streamDialog({
                title: 'Match result',
                content: (
                  <>
                    <MatchReportDisplay matchReport={matchReport} />
                  </>
                ),
              })
            })
          }}
        >
          Fight
        </ActionButton>
      </div>
    </>
  )
}
