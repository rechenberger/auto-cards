'use client'

import { MetaResponse } from '@/contracts/meta'
import { MatchReplayResponse } from '@/contracts/replay'
import { cn } from '@/lib/utils'
import { Swords } from 'lucide-react'
import { useMemo } from 'react'
import { MatchReportPlaybackControls } from './MatchReportPlaybackControls'
import { MatchReportProvider } from './MatchReportProvider'
import { MatchReplayBackground } from './MatchReplayBackground'
import { MatchReplayCards } from './MatchReplayCards'
import { MatchReplaySide } from './MatchReplaySide'
import { MatchReplayTabs } from './MatchReplayTabs'

export const MatchReplayView = ({
  replay,
  meta,
}: {
  replay: MatchReplayResponse
  meta: MetaResponse | null
}) => {
  const input = useMemo(
    () => ({
      participants: replay.participants.map((participant) => ({
        loadout: participant.loadout,
      })),
      seed: [replay.match.seed],
      skipLogs: false,
      rulesetVersion: replay.rulesetVersion,
      allItems: replay.assets.itemDefinitions,
    }),
    [replay],
  )
  const themes = replay.participants.map((participant) =>
    replay.assets.themes.find((theme) => theme.name === participant.themeId),
  )
  const backgroundThemeId = replay.participants
    .map((participant) => participant.themeId)
    .join('~')
  const backgroundImageUrl = replay.assets.images.find(
    (image) =>
      image.itemId === 'match-bg' && image.themeId === backgroundThemeId,
  )?.url

  if (!themes[0] || !themes[1]) return null

  return (
    <MatchReportProvider input={input}>
      <MatchReplayBackground imageUrl={backgroundImageUrl} />
      <div
        className={cn(
          'flex-1 grid gap-4',
          'grid-cols-[1fr_1fr_!important]',
          'grid-rows-[auto_auto_1fr_!important]',
          "[grid-template:'middle_middle'_'stats_stats'_'left_right']",
          'xl:grid-cols-[auto_1fr_auto_!important]',
          'xl:grid-rows-[1fr_auto_auto_!important]',
          "xl:[grid-template:'left_middle_right'_'stats_stats_stats']",
        )}
      >
        <div
          style={{ gridArea: 'left' }}
          className="flex flex-row gap-4 items-start xl:items-center justify-start"
        >
          <MatchReplayCards
            participant={replay.participants[0]}
            itemDefinitions={replay.assets.itemDefinitions}
            theme={themes[0]}
            images={replay.assets.images}
          />
        </div>
        <div
          style={{ gridArea: 'right' }}
          className="flex flex-row gap-4 items-start xl:items-center justify-end"
        >
          <MatchReplayCards
            participant={replay.participants[1]}
            itemDefinitions={replay.assets.itemDefinitions}
            theme={themes[1]}
            images={replay.assets.images}
          />
        </div>
        <div
          className="flex-1 flex flex-col gap-2 items-center justify-center self-stretch"
          style={{ gridArea: 'middle' }}
        >
          <MatchReportPlaybackControls />
          <MatchReplayTabs replay={replay} meta={meta} />
          <div className="flex-1" />
        </div>
        <div style={{ gridArea: 'stats' }}>
          <div className="flex flex-row gap-2 justify-center relative">
            <div className="max-xl:flex-1 flex flex-col gap-4">
              <MatchReplaySide participant={replay.participants[0]} />
            </div>
            <div className="absolute top-8 z-10">
              <Swords className="size-8 xl:size-16" />
            </div>
            <div className="max-xl:flex-1 flex flex-col gap-4">
              <MatchReplaySide participant={replay.participants[1]} />
            </div>
          </div>
        </div>
      </div>
    </MatchReportProvider>
  )
}
