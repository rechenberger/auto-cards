'use client'

import { useCatalog } from '@/client/api/catalog'
import { useLiveMatchResults } from '@/client/api/liveMatches'
import { QueryError } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LiveMatchResultEntryDto,
  LiveMatchResultsDto,
} from '@/contracts/live-api'
import { ItemData } from '@/game/ItemData'
import { countifyItems } from '@/game/countifyItems'
import { getNumberOfRounds } from '@/game/gameVersion'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Fragment } from 'react'
import { ItemCardClient } from '@/features/game/ItemCardClient'

const ResultBoard = ({
  entry,
  rulesetVersion,
}: {
  entry: LiveMatchResultEntryDto
  rulesetVersion: number
}) => (
  <div className="grid grid-cols-5 gap-2 self-center rounded-3xl bg-gray-500/20 p-2">
    {Array.from({ length: getNumberOfRounds(rulesetVersion) }, (_, roundNo) => {
      const round = entry.rounds.find(
        (candidate) => candidate.roundNo === roundNo,
      )
      const status = round?.status
      const circle = (
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-center text-lg font-bold leading-none text-white',
            status === 'won'
              ? 'bg-amber-300'
              : status === 'lost'
                ? 'bg-gray-500'
                : 'bg-gray-500/20',
          )}
          aria-label={
            status
              ? `Round ${roundNo + 1}: ${status}, ${round?.points ?? 0} points`
              : `Round ${roundNo + 1}: not played`
          }
        >
          {status ? round?.points : null}
        </div>
      )

      return round?.matchId ? (
        <Link
          key={roundNo}
          href={`/match/${round.matchId}`}
          target="_blank"
          aria-label={`Open replay for round ${roundNo + 1}`}
          className="touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {circle}
        </Link>
      ) : (
        <div key={roundNo}>{circle}</div>
      )
    })}
  </div>
)

const ResultLoadouts = ({
  entries,
}: {
  entries: LiveMatchResultEntryDto[]
}) => {
  const catalog = useCatalog()
  if (catalog.isLoading) {
    return <Skeleton className="col-span-full h-24 w-full" />
  }
  if (catalog.isError || !catalog.data) {
    return (
      <div className="col-span-full text-sm text-muted-foreground">
        Card images could not be loaded.
      </div>
    )
  }

  return (
    <>
      {entries.map((entry) => (
        <div
          key={`cards-${entry.participationId}`}
          className="col-span-2 mb-2 border-b pb-3 md:col-span-4"
        >
          <div className="mb-2 text-sm font-semibold">
            {entry.displayName}&apos;s latest loadout
          </div>
          {entry.latestLoadout ? (
            <div className="flex flex-wrap items-start justify-start gap-1">
              {countifyItems(entry.latestLoadout.items).map(
                (item: ItemData, itemIndex) => (
                  <ItemCardClient
                    key={`${item.name}-${itemIndex}`}
                    itemData={item}
                    catalog={catalog.data}
                    size="80"
                  />
                ),
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No loadout played yet.
            </div>
          )}
        </div>
      ))}
    </>
  )
}

const ResultsContent = ({
  results,
  showCards,
}: {
  results: LiveMatchResultsDto
  showCards: boolean
}) => {
  if (results.entries.length === 0) {
    return (
      <Card className="max-w-2xl p-6 text-center text-sm text-muted-foreground">
        Results appear after the first matches have been played.
      </Card>
    )
  }

  return (
    <Card className="flex max-w-2xl flex-col gap-3 p-3 text-left">
      <div className="flex items-baseline gap-2">
        <div className="flex-1 font-semibold">⚡ Live Match Results</div>
        <div className="text-xs text-muted-foreground">
          Ruleset {results.rulesetVersion}
        </div>
      </div>
      <div className="grid grid-cols-[auto_auto] items-center justify-center gap-2 md:grid-cols-[auto_1fr_auto_auto]">
        {results.entries.map((entry) => (
          <Fragment key={entry.participationId}>
            <div
              className="font-sans tabular-nums"
              aria-label={`Rank ${entry.rank}`}
            >
              <span>{entry.rank}</span>
              <span className="ordinal">{getOrdinalSuffix(entry.rank)}</span>
            </div>
            <div className="truncate text-right md:text-left">
              {entry.displayName}
            </div>
            <ResultBoard
              entry={entry}
              rulesetVersion={results.rulesetVersion}
            />
            <div className="text-right font-bold tabular-nums">
              {entry.score}&nbsp;Pt.
            </div>
          </Fragment>
        ))}
        {showCards && <ResultLoadouts entries={results.entries} />}
      </div>
    </Card>
  )
}

export const LiveMatchResults = ({
  liveMatchId,
  showCards = false,
  poll = false,
}: {
  liveMatchId: string
  showCards?: boolean
  poll?: boolean
}) => {
  const results = useLiveMatchResults(liveMatchId, { poll })

  if (results.isLoading) {
    return (
      <Skeleton
        className="h-48 w-full max-w-2xl"
        aria-label="Loading live match results"
      />
    )
  }
  if (results.isError || !results.data) {
    return (
      <QueryError error={results.error} retry={() => void results.refetch()} />
    )
  }

  if (showCards || results.data.entries.length === 0) {
    return <ResultsContent results={results.data} showCards={showCards} />
  }

  return (
    <div className="flex flex-col gap-2">
      <ResultsContent results={results.data} showCards={false} />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 touch-manipulation self-center"
          >
            Show Cards
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Live Match Results</DialogTitle>
            <DialogDescription>
              Final loadouts and round scores for every player.
            </DialogDescription>
          </DialogHeader>
          <ResultsContent results={results.data} showCards />
        </DialogContent>
      </Dialog>
    </div>
  )
}
