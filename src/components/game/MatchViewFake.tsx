import { Match } from '@/db/schema-zod'
import { LoadoutData } from '@/game/LoadoutData'
import { GAME_VERSION } from '@/game/config'
import { DefaultGameMode, GameMode } from '@/game/gameMode'
import { MatchParticipant } from './MatchParticipants'
import { MatchView } from './MatchView'

export const MatchViewFake = ({
  seed,
  gameMode = DefaultGameMode,
  loadouts,
}: {
  seed: string
  gameMode?: GameMode
  loadouts: LoadoutData[]
}) => {
  const now = new Date().toISOString()
  const match: Match = {
    id: 'fake',
    data: {
      seed,
    },
    createdAt: now,
    updatedAt: now,
    liveMatchId: null,
    gameMode,
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
      version: GAME_VERSION,
      gameMode: DefaultGameMode,
    },
  }))

  return (
    <MatchView
      match={match}
      forceParticipants={participants}
      // calculateChangemakers
    />
  )
}
