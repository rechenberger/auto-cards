import { playgroundHref } from '@/app/(main)/admin/playground/playgroundHref'
import { getIsAdmin } from '@/auth/getIsAdmin'
import { ItemCardGrid } from '@/components/game/ItemCardGrid'
import { Loadout } from '@/db/schema-zod'
import { addToLeaderboard } from '@/game/addToLeaderboard'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { orderBy } from 'lodash-es'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'

export const LeaderboardBenchmarkButton = ({
  loadout,
}: {
  loadout: Loadout
}) => {
  return (
    <>
      <ActionButton
        catchToast
        variant="ghost"
        size="icon"
        hideIcon
        action={async () => {
          'use server'
          return superAction(async () => {
            const isAdmin = await getIsAdmin({ allowDev: true })

            const result = await addToLeaderboard({
              loadout,
              dryRun: true,
            })
            if (!result) {
              throw new Error('Failed to add to leaderboard')
            }

            let entries = result.results

            entries = orderBy(result.results, (r) => r.entry.score, 'desc')

            entries = orderBy(result.results, (r) => r.win, 'asc')

            streamDialog({
              title: `${result.score.toFixed(2)}% Win Rate`,
              content: (
                <>
                  <div className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-2 gap-y-4">
                    {entries.map((e) => (
                      <Fragment key={e.entry.id}>
                        <div>{e.win ? '👑' : '💀'}</div>
                        <div className="font-sans">
                          {e.rank}
                          <span className="ordinal">
                            {getOrdinalSuffix(e.rank)}
                          </span>
                        </div>
                        <div>
                          <ItemCardGrid
                            items={e.entry.loadout.data.items}
                            size="tiny"
                            className="justify-start"
                          />
                        </div>
                        <div>{e.entry.score.toFixed(2)}</div>
                        <div>
                          {isAdmin && (
                            <Link
                              href={playgroundHref({
                                loadouts: [loadout.data, e.entry.loadout.data],
                                mode: 'fight',
                                seed: e.seed,
                              })}
                              target="_blank"
                            >
                              <ExternalLink className="size-4" />
                            </Link>
                          )}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </>
              ),
            })
          })
        }}
      >
        <ExternalLink className="size-4" />
      </ActionButton>
    </>
  )
}
