'use client'

import {
  AdminLeaderboardCommand,
  AdminLeaderboardResult,
} from '@/contracts/admin-leaderboard'
import { useCatalog, useMeta } from '@/client/api/catalog'
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
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { useMutation } from '@tanstack/react-query'
import { RotateCw, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const catalog = useCatalog(meta.data?.viewer?.themeId)
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

  if (leaderboard.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading leaderboard…" />
  }
  if (
    leaderboard.error ||
    catalog.error ||
    !leaderboard.data ||
    !catalog.data
  ) {
    return (
      <QueryError
        error={leaderboard.error ?? catalog.error}
        retry={() => {
          leaderboard.refetch()
          catalog.refetch()
        }}
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 xl:flex-row xl:items-center">
        <h1 className="flex-1 text-xl font-bold">Leaderboard</h1>
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
          <span>Round</span>
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

      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const items = orderItems(
            countifyItems(entry.loadout.items),
            meta.data?.rulesetVersion,
          )
          return (
            <div
              key={entry.id}
              className="grid items-center gap-3 rounded-xl border p-3 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-bold tabular-nums">
                {entry.rank}
              </div>
              <div>
                <div className="font-medium">{entry.displayName}</div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">
                    {entry.score.toFixed(2)}%
                  </span>
                  {entry.createdAt && (
                    <TimeAgo date={new Date(entry.createdAt)} />
                  )}
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
                <div className="mt-2 flex flex-wrap gap-1">
                  {items.map((item, index) => (
                    <ItemCardClient
                      key={`${item.name}-${index}`}
                      itemData={item}
                      catalog={catalog.data}
                      size="80"
                    />
                  ))}
                </div>
              </div>
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
          )
        })}
      </div>
    </div>
  )
}
