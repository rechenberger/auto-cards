import {
  LiveMatchListDto,
  LiveMatchResultsDto,
  LiveMatchViewDto,
} from '@/contracts/live-api'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { GAME_VERSION } from '@/game/config'
import { getUserName } from '@/game/getUserName'
import { rankByScore } from '@/game/rankByScore'
import { notFound } from '@/server/api/ApiError'
import type { ApiPrincipal } from '@/server/auth/apiPrincipal'
import { desc, eq, inArray } from 'drizzle-orm'

const resolveRulesetVersion = ({
  data,
  gameVersions,
}: {
  data: { rulesetVersion?: number }
  gameVersions: number[]
}) => data.rulesetVersion ?? gameVersions[0] ?? GAME_VERSION

export const getLiveMatchView = async ({
  liveMatchId,
  principal,
}: {
  liveMatchId: string
  principal: ApiPrincipal
}): Promise<LiveMatchViewDto> => {
  const liveMatch = await db.query.liveMatch.findFirst({
    where: eq(schema.liveMatch.id, liveMatchId),
    with: {
      liveMatchParticipations: {
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
      games: {
        columns: { id: true, userId: true, version: true },
      },
    },
  })
  if (!liveMatch) throw notFound('Live match not found')

  const participants = liveMatch.liveMatchParticipations.map(
    (participation) => {
      const game = liveMatch.games.find(
        (candidate) => candidate.userId === participation.userId,
      )
      return {
        id: participation.id,
        displayName: getUserName({ user: participation.user }),
        isHost: participation.data.isHost,
        ready: participation.data.ready,
        hasGame: Boolean(game),
        isCurrentUser: participation.userId === principal.userId,
      }
    },
  )
  const myParticipation = liveMatch.liveMatchParticipations.find(
    (participation) => participation.userId === principal.userId,
  )
  const myGame = liveMatch.games.find(
    (game) => game.userId === principal.userId,
  )
  const allReady =
    participants.length > 0 &&
    participants.every((participant) => participant.ready)
  const canStartMatches = Boolean(
    myParticipation?.data.isHost &&
      participants.length > 1 &&
      allReady &&
      participants.every((participant) => participant.hasGame),
  )

  return LiveMatchViewDto.parse({
    id: liveMatch.id,
    status: liveMatch.status,
    rulesetVersion: resolveRulesetVersion({
      data: liveMatch.data,
      gameVersions: liveMatch.games.map((game) => game.version),
    }),
    createdAt: liveMatch.createdAt,
    updatedAt: liveMatch.updatedAt,
    participants,
    me: myParticipation
      ? {
          participationId: myParticipation.id,
          isHost: myParticipation.data.isHost,
          ready: myParticipation.data.ready,
          gameId: myGame?.id ?? null,
        }
      : null,
    allReady,
    canStartMatches,
  })
}

export const getLatestLiveMatches = async (): Promise<LiveMatchListDto> => {
  const liveMatches = await db.query.liveMatch.findMany({
    orderBy: desc(schema.liveMatch.createdAt),
    limit: 10,
    with: {
      liveMatchParticipations: { columns: { id: true } },
      games: { columns: { version: true } },
    },
  })

  return LiveMatchListDto.parse({
    matches: liveMatches.map((liveMatch) => ({
      id: liveMatch.id,
      status: liveMatch.status,
      rulesetVersion: resolveRulesetVersion({
        data: liveMatch.data,
        gameVersions: liveMatch.games.map((game) => game.version),
      }),
      createdAt: liveMatch.createdAt,
      participantCount: liveMatch.liveMatchParticipations.length,
    })),
  })
}

export const getLiveMatchResults = async ({
  liveMatchId,
}: {
  liveMatchId: string
}): Promise<LiveMatchResultsDto> => {
  const liveMatch = await db.query.liveMatch.findFirst({
    where: eq(schema.liveMatch.id, liveMatchId),
    with: {
      liveMatchParticipations: {
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
      games: {
        columns: {
          id: true,
          userId: true,
          version: true,
          data: true,
        },
      },
    },
  })
  if (!liveMatch) throw notFound('Live match not found')

  const gameIds = liveMatch.games.map((game) => game.id)
  const loadouts = gameIds.length
    ? await db.query.loadout.findMany({
        where: inArray(schema.loadout.gameId, gameIds),
        with: { primaryMatchParticipation: true },
      })
    : []

  const entries = liveMatch.liveMatchParticipations.flatMap((participation) => {
    const game = liveMatch.games.find(
      (candidate) => candidate.userId === participation.userId,
    )
    if (!game) return []

    const gameLoadouts = loadouts
      .filter((loadout) => loadout.gameId === game.id)
      .toSorted((a, b) => a.roundNo - b.roundNo)
    const rounds = gameLoadouts.map((loadout) => {
      const status = loadout.primaryMatchParticipation?.status ?? null
      return {
        roundNo: loadout.roundNo,
        status,
        matchId: loadout.primaryMatchParticipation?.matchId ?? null,
        points: status === 'won' ? loadout.roundNo + 1 : 0,
      }
    })
    const latestLoadout = gameLoadouts.at(-1)

    return [
      {
        participationId: participation.id,
        displayName: getUserName({ user: participation.user }),
        gameId: game.id,
        rank: 0,
        score: rounds.reduce((sum, round) => sum + round.points, 0),
        currentRoundNo: game.data.roundNo,
        rounds,
        latestLoadout: latestLoadout
          ? {
              id: latestLoadout.id,
              roundNo: latestLoadout.roundNo,
              items: latestLoadout.data.items,
            }
          : null,
      },
    ]
  })

  return LiveMatchResultsDto.parse({
    liveMatchId,
    rulesetVersion: resolveRulesetVersion({
      data: liveMatch.data,
      gameVersions: liveMatch.games.map((game) => game.version),
    }),
    entries: rankByScore({ entries }),
  })
}
