import { MatchParticipant } from '@/components/game/MatchParticipants'
import { MatchView } from '@/components/game/MatchView'
import { Match } from '@/db/schema-zod'
import { GAME_VERSION } from '@/game/config'
import { PlaygroundOptions } from './playgroundHref'

export const PlaygroundMatchView = ({
  options,
}: {
  options: PlaygroundOptions
}) => {
  const now = new Date().toISOString()
  const match: Match = {
    id: 'fake',
    data: {
      seed: options.seed,
    },
    createdAt: now,
    updatedAt: now,
    liveMatchId: null,
  }
  const participants: MatchParticipant[] = options.loadouts.map(
    (loadout, sideIdx) => ({
      id: `p-${sideIdx}`,
      createdAt: now,
      updatedAt: now,
      status: 'won',
      matchId: 'fake',
      userId: `u-${sideIdx}`,
      loadoutId: `l-${sideIdx}`,
      sideIdx,
      user: null,
      data: {},
      loadout: {
        createdAt: now,
        updatedAt: now,
        id: `l-${sideIdx}`,
        data: loadout,
        userId: null,
        roundNo: 1,
        gameId: `g-${sideIdx}`,
        primaryMatchParticipationId: null,
        version: GAME_VERSION,
      },
    }),
  )

  return (
    <MatchView
      match={match}
      forceParticipants={participants}
      // calculateChangemakers
    />
  )
}
