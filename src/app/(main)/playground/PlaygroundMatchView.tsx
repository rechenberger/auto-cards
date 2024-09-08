import { MatchParticipant } from '@/components/game/MatchParticipants'
import { MatchView } from '@/components/game/MatchView'
import { LoadoutData, Match } from '@/db/schema-zod'

export const PlaygroundMatchView = async ({
  loadouts,
}: {
  loadouts: LoadoutData[]
}) => {
  const now = new Date().toISOString()
  const match: Match = {
    id: 'fake',
    data: {
      seed: 'fake',
    },
    createdAt: now,
    updatedAt: now,
    liveMatchId: null,
  }
  const participants: MatchParticipant[] = loadouts.map((loadout, sideIdx) => ({
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
    },
  }))

  return <MatchView match={match} forceParticipants={participants} />
}
