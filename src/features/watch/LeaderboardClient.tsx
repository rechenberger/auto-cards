'use client'

import {
  AdminLeaderboardCommand,
  AdminLeaderboardResult,
} from '@/contracts/admin-leaderboard'
import { useMeta } from '@/client/api/catalog'
import { useLeaderboard } from '@/client/api/watch'
import { fetchApi } from '@/client/api/fetchApi'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { TimeAgo } from '@/components/simple/TimeAgo'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { calcLoadoutPrice } from '@/game/calcLoadoutPrice'
import { countifyItems } from '@/game/countifyItems'
import { DEFAULT_GAME_VERSION, getNumberOfRounds } from '@/game/gameVersion'
import { orderItems } from '@/game/orderItems'
import { LEADERBOARD_TYPE, LEADERBOARD_TYPE_ACC } from '@/game/rules'
import { TinyItem } from '@/components/game/TinyItem'
import { useMutation } from '@tanstack/react-query'
import { RotateCw, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment } from 'react'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { cn } from '@/lib/utils'

export const LeaderboardClient = () => {
  const router = useRouter()
  const params = useSearchParams()
  const meta = useMeta()
  const roundParam = params.get('round')
  const numberOfRounds =
    meta.data?.numberOfRounds ?? getNumberOfRounds(DEFAULT_GAME_VERSION)
  const parsedRound = Number(roundParam)
  const hasValidRound =
    roundParam !== null &&
    Number.isInteger(parsedRound) &&
    parsedRound >= 1 &&
    parsedRound <= numberOfRounds
  const round = hasValidRound ? parsedRound : numberOfRounds
  const type = hasValidRound ? LEADERBOARD_TYPE : LEADERBOARD_TYPE_ACC
  const view = params.get('view') === 'user' ? 'user' : 'all'
  const leaderboard = useLeaderboard({ round, type })
  const adminCommand = useMutation({
    mutationFn: (command: typeof AdminLeaderboardCommand._type) =>
      fetchApi('/api/v1/admin/leaderboard', AdminLeaderboardResult, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify(command),
      }),
    onSuccess: () => leaderboard.refetch(),
  })

  if (leaderboard.isLoading) {
    return <QueryLoading label="Loading leaderboard…" />
  }
  if (leaderboard.error || !leaderboard.data) {
    return (
      <QueryError
        error={leaderboard.error}
        retry={() => leaderboard.refetch()}
      />
    )
  }

  const entries =
    view === 'all'
      ? leaderboard.data.entries
      : leaderboard.data.entries.filter(
          (entry, index, all) =>
            all.findIndex(
              (candidate) => candidate.displayName === entry.displayName,
            ) === index,
        )

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(updates).forEach(([key, value]) =>
      value === null ? next.delete(key) : next.set(key, value),
    )
    router.replace(`/watch/leaderboard?${next.toString()}`)
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 xl:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        {leaderboard.data.isAdmin && (
          <div className="flex gap-2">
            <ConfirmButton
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Clean duplicate leaderboard entries"
              disabled={adminCommand.isPending}
              title="Remove duplicate entries?"
              description="The highest-scoring entry for each loadout remains."
              confirmLabel="Clean leaderboard"
              onConfirm={() =>
                adminCommand.mutateAsync({ type: 'clean-duplicates' })
              }
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ConfirmButton>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Queue leaderboard refresh"
              disabled={adminCommand.isPending}
              onClick={() => adminCommand.mutate({ type: 'refresh' })}
            >
              <RotateCw className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Round</span>
          <select
            className="min-h-11 rounded-md border bg-background px-3 text-base"
            value={hasValidRound && roundParam ? roundParam : 'all'}
            onChange={(event) =>
              updateParams({
                round: event.target.value === 'all' ? null : event.target.value,
              })
            }
          >
            <option value="all">All rounds</option>
            {Array.from({ length: numberOfRounds }, (_, index) => (
              <option key={index} value={index + 1}>
                Round {index + 1}
              </option>
            ))}
          </select>
        </label>
        <div className="flex rounded-md border p-1">
          <Button
            type="button"
            size="sm"
            variant={view === 'all' ? 'default' : 'ghost'}
            onClick={() => updateParams({ view: null })}
          >
            Top Builds
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'user' ? 'default' : 'ghost'}
            onClick={() => updateParams({ view: 'user' })}
          >
            Top Players
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 xl:grid-cols-[auto_auto_1fr_auto]">
        {entries.map((entry) => {
          const items = orderItems(
            countifyItems(entry.loadout.items),
            meta.data?.rulesetVersion,
          )
          const top3Class = cn(
            entry.rank === 1 &&
              'bg-gradient-to-bl from-amber-100 to-amber-500 text-black',
            entry.rank === 2 &&
              'border-gray-300 bg-gradient-to-bl from-gray-100 to-gray-500 text-black',
            entry.rank === 3 &&
              'border-orange-300 bg-gradient-to-bl from-orange-100 to-orange-500 text-black',
          )
          const repeated = leaderboard.data.entries.filter(
            (candidate) => candidate.displayName === entry.displayName,
          ).length
          return (
            <Fragment key={entry.id}>
              <div
                className={cn(
                  'flex w-24 flex-col items-center justify-center rounded-md border-2 border-amber-300 px-2 py-1 text-amber-300',
                  top3Class,
                )}
              >
                <div className="font-sans text-4xl font-bold tabular-nums">
                  {entry.rank}
                  <span className="ordinal">
                    {getOrdinalSuffix(entry.rank)}
                  </span>
                </div>
                <div className="font-sans tabular-nums">
                  {entry.score.toFixed(2)}%
                </div>
              </div>
              <div>
                <div>{entry.displayName}</div>
                {view === 'user' && (
                  <div className="text-sm">
                    {repeated}x in Top {leaderboard.data.entries.length}
                  </div>
                )}
                {entry.createdAt && (
                  <div className="text-sm opacity-60">
                    <TimeAgo date={new Date(entry.createdAt)} />
                  </div>
                )}
                <div className="flex flex-row">
                  <StatsDisplay
                    stats={{
                      gold: calcLoadoutPrice(
                        entry.loadout,
                        meta.data?.rulesetVersion,
                      ),
                    }}
                    size="sm"
                  />
                </div>
              </div>
              <div className="hidden flex-wrap items-start justify-start gap-1 xl:flex">
                {items.map((item, index) => (
                  <TinyItem key={`${item.name}-${index}`} itemData={item} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {leaderboard.data.isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={`Recalculate ${entry.displayName}`}
                    onClick={() =>
                      adminCommand.mutate({
                        type: 'score-loadout',
                        loadoutId: entry.loadoutId,
                      })
                    }
                  >
                    <RotateCw className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
              <div className="col-span-3 flex flex-wrap items-start justify-start gap-1 xl:hidden">
                {items.map((item, index) => (
                  <TinyItem key={`${item.name}-${index}`} itemData={item} />
                ))}
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
