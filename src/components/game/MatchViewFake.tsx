'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import type { MatchReplayResponse } from '@/contracts/replay'
import type { Game, User } from '@/db/schema-zod'
import type { LoadoutData } from '@/game/LoadoutData'
import { DefaultGameMode, type GameMode } from '@/game/gameMode'
import { fallbackThemeId } from '@/game/themes'
import { MatchReplayView } from './MatchReplayView'

export const MatchViewFake = ({
  game,
  seed,
  gameMode = DefaultGameMode,
  sides,
}: {
  game?: Game
  seed: string
  gameMode?: GameMode
  sides: {
    loadoutData: LoadoutData
    user?: User
  }[]
}) => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)

  if (meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading playground match…" />
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
  if (sides.length !== 2) {
    return <QueryError error={new Error('A match needs exactly two sides.')} />
  }

  const rulesetVersion = game?.version ?? meta.data.rulesetVersion
  const replay: MatchReplayResponse = {
    apiVersion: 'v1',
    match: {
      id: 'playground',
      seed,
      gameMode,
      createdAt: null,
    },
    rulesetVersion,
    currentRulesetVersion: meta.data.rulesetVersion,
    participants: sides.map((side, sideIdx) => ({
      sideIdx,
      status: sideIdx === 0 ? 'won' : 'lost',
      displayName: side.user?.name ?? `Side ${sideIdx + 1}`,
      themeId: fallbackThemeId(side.user?.themeId ?? catalog.data.imageThemeId),
      loadoutId: `playground-${sideIdx}`,
      loadout: side.loadoutData,
    })) as MatchReplayResponse['participants'],
    assets: {
      itemDefinitions: catalog.data.items,
      themes: catalog.data.themes,
      images: catalog.data.images,
    },
  }

  return <MatchReplayView replay={replay} meta={meta.data} />
}
