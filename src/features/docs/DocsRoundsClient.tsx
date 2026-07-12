'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { RarityWeightsDisplay } from '@/components/game/RarityWeightsDisplay'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { getRoundStats } from '@/game/roundStats'
import { ItemCardClient } from '@/features/game/ItemCardClient'

export const DocsRoundsClient = () => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)

  if (meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading rounds…" />
  }
  if (meta.error || catalog.error || !meta.data || !catalog.data) {
    return (
      <QueryError
        error={meta.error ?? catalog.error}
        retry={() => {
          meta.refetch()
          catalog.refetch()
        }}
      />
    )
  }

  const rounds = getRoundStats(meta.data.rulesetVersion)
  return (
    <div className="flex flex-row flex-wrap items-start gap-2 gap-y-8 xl:grid xl:grid-cols-5 xl:self-center">
      {rounds.map((round, index) => {
        const nextRound = rounds[index + 1]
        return (
          <section key={round.roundNo} className="flex flex-col gap-2">
            <h1 className="text-center">Round {round.roundNo + 1}</h1>
            <div className="flex flex-col gap-0 rounded-md bg-border px-4 py-2">
              <div className="mb-1 self-center font-bold">Shop Chances</div>
              <RarityWeightsDisplay rarityWeights={round.rarityWeights} />
            </div>
            {nextRound && (
              <div className="flex flex-col items-center gap-2 self-center rounded-md bg-border px-4 py-2">
                <div className="text-center">Next Round Gain</div>
                <StatsDisplay stats={{ gold: nextRound.gold }} />
                <ItemCardClient
                  itemData={{ name: 'experience', count: nextRound.experience }}
                  catalog={catalog.data}
                  size="160"
                  onlyTop
                />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
