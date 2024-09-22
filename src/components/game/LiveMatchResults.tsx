import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getLiveMatchStuff } from '@/game/getLiveMatchStuff'
import { getUserName } from '@/game/getUserName'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import { eq } from 'drizzle-orm'
import { orderBy, sum } from 'lodash-es'
import { Fragment } from 'react'
import { Card } from '../ui/card'
import { GameMatchBoard } from './GameMatchBoard'

export const LiveMatchResults = async ({
  liveMatchId,
}: {
  liveMatchId: string
}) => {
  const liveMatch = await getLiveMatchStuff({ liveMatchId })
  if (!liveMatch) return null

  const allParticipations = await Promise.all(
    liveMatch.liveMatchParticipations.map(async (participation) => {
      const game = liveMatch.games.find(
        (g) => g.userId === participation.userId,
      )

      if (!game) return null

      const loadouts = await db.query.loadout.findMany({
        where: eq(schema.loadout.gameId, game.id),
        with: {
          primaryMatchParticipation: {
            with: {
              match: true,
            },
          },
        },
      })

      const scores = loadouts.map((loadout) => {
        const isWin = loadout.primaryMatchParticipation?.status === 'won'
        if (!isWin) return 0

        return loadout.roundNo + 1
      })

      const score = sum(scores)

      return {
        ...participation,
        game,
        score,
        rank: 0,
      }
    }),
  )
  let participations = allParticipations.flatMap((p) => (p ? p : []))
  participations = orderBy(participations, (p) => p.score, 'desc')

  // Ranking FROM: https://teampilot.ai/team/tristan/chat/fc29064dc7e58d739e6c5421322c11e3
  let rank = 1
  let prevScore = participations[0].score
  let nextRank = 1
  participations = participations.map((p, index) => {
    if (index > 0 && p.score === prevScore) {
      p.rank = rank
    } else {
      rank = nextRank
      p.rank = rank
    }
    prevScore = p.score
    nextRank++
    return p
  })

  return (
    <>
      <Card className="flex flex-col gap-2 p-2 text-left">
        <div className="flex flex-row gap-2 items-baseline">
          <div className="flex-1">⚡ Live Match Results</div>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
          {participations.map((p) => {
            return (
              <Fragment key={p.id}>
                <div>
                  <div className="font-sans">
                    <span>{p.rank}</span>
                    <span className="ordinal">{getOrdinalSuffix(p.rank)}</span>
                  </div>
                </div>
                <div className="flex-1">{getUserName({ user: p.user })}</div>
                <div className="">
                  <GameMatchBoard game={p.game} />
                </div>
                <div className="text-right font-bold">{p.score} Pt.</div>
              </Fragment>
            )
          })}
        </div>
      </Card>
    </>
  )
}
