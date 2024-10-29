import { Game, Match, User } from '@/db/schema-zod'
import { LoadoutData } from '@/game/LoadoutData'
import { GAME_VERSION } from '@/game/config'
import { DefaultGameMode, GameMode } from '@/game/gameMode'
import { MatchParticipant } from './MatchParticipants'
import { MatchView } from './MatchView'

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

  const participants: MatchParticipant[] = sides.map((side, sideIdx) => ({
    id: `p-${sideIdx}`,
    createdAt: now,
    updatedAt: now,
    status: 'won',
    matchId: 'fake',
    userId: side.user?.id ?? `u-${sideIdx}`,
    loadoutId: `l-${sideIdx}`,
    sideIdx,
    user: side.user ?? null,
    data: {},
    loadout: {
      createdAt: now,
      updatedAt: now,
      id: `l-${sideIdx}`,
      data: side.loadoutData,
      userId: null,
      roundNo: 1,
      gameId: `g-${sideIdx}`,
      primaryMatchParticipationId: null,
      version: GAME_VERSION,
      gameMode,
    },
  }))

  return (
    <MatchView
      game={game}
      match={match}
      forceParticipants={participants}
      // calculateChangemakers
    />
  )
}
