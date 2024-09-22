import { getIsAdmin } from '@/auth/getIsAdmin'
import { ItemCardGrid } from '@/components/game/ItemCardGrid'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addAllToLeaderboard } from '@/game/addAllToLeaderboard'
import { addToLeaderboard } from '@/game/addToLeaderboard'
import { getBotName } from '@/game/botName'
import { calcLoadoutPrice } from '@/game/calcLoadoutPrice'
import { getLeaderboard } from '@/game/getLeaderboard'
import { getUserName } from '@/game/getUserName'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { createStreamableUI } from 'ai/rsc'
import { uniqBy } from 'lodash-es'
import { RotateCw } from 'lucide-react'
import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Leaderboard',
}

export default async function Page({
  searchParams,
}: {
  searchParams: { view: string }
}) {
  const entries = await getLeaderboard({})
  const isAdmin = await getIsAdmin({ allowDev: false })

  const view = searchParams.view ?? 'all'

  const entriesShown =
    view === 'user' ? uniqBy(entries, (e) => e.userId) : entries

  return (
    <>
      <div className="flex flex-col xl:flex-row items-center gap-2">
        <div className="flex flex-col flex-1 gap-2">
          <h2 className="font-bold text-xl">Leaderboard</h2>
        </div>
        {isAdmin && (
          <>
            <ActionButton
              catchToast
              variant="outline"
              askForConfirmation={{
                title: 'Add All to Leaderboard?',
                content: 'This will take a while',
              }}
              action={async () => {
                'use server'
                return superAction(async () => {
                  const ui = createStreamableUI()
                  streamDialog({
                    title: 'Adding All to Leaderboard...',
                    content: <>{ui.value}</>,
                  })
                  addAllToLeaderboard({
                    onUpdate: (info) => {
                      ui.update(
                        <>
                          <Progress value={(100 * info.current) / info.total} />
                        </>,
                      )
                      if (info.done) {
                        ui.done(
                          <>
                            <Progress value={100} />
                          </>,
                        )
                        revalidatePath('/watch/leaderboard')
                      }
                    },
                  })
                })
              }}
            >
              Add All to Leaderboard
            </ActionButton>
            <ActionButton
              catchToast
              variant="outline"
              askForConfirmation={{
                title: 'Update Leaderboard?',
                content: 'This will take a while',
              }}
              action={async () => {
                'use server'
                return superAction(async () => {
                  const ui = createStreamableUI()
                  let done = 0
                  const exec = async () => {
                    for (const entry of entries) {
                      ui.update(
                        <>
                          <Progress value={(100 * done) / entries.length} />
                        </>,
                      )
                      await addToLeaderboard({ loadout: entry.loadout })
                      done++
                    }
                    ui.done(
                      <>
                        <Progress value={100} />
                      </>,
                    )
                    streamRevalidatePath('/watch/leaderboard')
                  }
                  streamDialog({
                    title: 'Leaderboard Updated',
                    content: <>{ui.value}</>,
                  })
                  exec()
                })
              }}
            >
              Update Leaderboard
            </ActionButton>
          </>
        )}
        <Tabs value={view}>
          <TabsList>
            <TabsTrigger value="all">
              <Link href="/watch/leaderboard">Top Builds</Link>
            </TabsTrigger>
            <TabsTrigger value="user" asChild>
              <Link href="/watch/leaderboard?view=user">Top Players</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] xl:grid-cols-[auto_auto_1fr_auto] gap-4 items-center">
        {entriesShown.map((entry, idx) => {
          const loadout = entry.loadout
          const name = entry.user
            ? getUserName({ user: entry.user })
            : getBotName({ seed: loadout.id })

          return (
            <Fragment key={entry.id}>
              <div className="text-xl">#{idx + 1}</div>
              <div>
                <div>{name}</div>
                {loadout.createdAt && (
                  <div className="text-sm opacity-60">
                    <TimeAgo date={new Date(loadout.createdAt)} />
                  </div>
                )}
                <div className="flex flex-row">
                  {calcLoadoutPrice(loadout.data).then((gold) => (
                    <StatsDisplay stats={{ gold }} size="sm" />
                  ))}
                </div>
              </div>
              <div className="justify-self-start hidden xl:flex">
                <ItemCardGrid
                  items={loadout.data.items}
                  className="justify-start"
                  size="80"
                  // themeId={loadout.user?.themeId ?? undefined}
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="text-xl text-right">
                  {entry.score.toFixed(2)}
                </div>
                {isAdmin && (
                  <ActionButton
                    catchToast
                    variant="ghost"
                    size="icon"
                    hideIcon
                    action={async () => {
                      'use server'
                      return superAction(async () => {
                        await addToLeaderboard({ loadout })
                        revalidatePath('/watch/leaderboard')
                      })
                    }}
                  >
                    <RotateCw className="size-4" />
                  </ActionButton>
                )}
              </div>
              <div className="flex justify-self-start col-span-4 xl:hidden">
                <ItemCardGrid
                  items={loadout.data.items}
                  className="justify-start"
                  size="tiny"
                  // themeId={loadout.user?.themeId ?? undefined}
                />
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
