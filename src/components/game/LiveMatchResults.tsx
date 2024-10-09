import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { getLiveMatchStuff } from '@/game/getLiveMatchStuff'
import { getUserName } from '@/game/getUserName'
import { rankByScore } from '@/game/rankByScore'
import { getOrdinalSuffix } from '@/lib/getOrdinalSuffix'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { maxBy, orderBy, sum } from 'lodash-es'
import { Fragment } from 'react'
import { Card } from '../ui/card'
import { GameMatchBoard } from './GameMatchBoard'
import { ItemCardGrid } from './ItemCardGrid'
import { LeaderboardRankCardByGame } from './LeaderboardRankCardByGame'

export const LiveMatchResults = async ({
  liveMatchId,
  showCards,
}: {
  liveMatchId: string
  showCards?: boolean
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

      const loadout = maxBy(loadouts, (l) => l.roundNo)
      if (!loadout) return null

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
        loadout,
      }
    }),
  )
  let participations = allParticipations.flatMap((p) => (p ? p : []))
  participations = orderBy(participations, (p) => p.score, 'desc')
  participations = rankByScore({ entries: participations })

  return (
    <>
      <Card className="flex flex-col gap-2 p-2 text-left max-w-2xl">
        <div className="flex flex-row gap-2 items-baseline">
          <div className="flex-1">⚡ Live Match Results</div>
          {!showCards && (
            <ActionButton
              hideIcon
              variant="outline"
              size="sm"
              action={async () => {
                'use server'
                return superAction(async () => {
                  streamDialog({
                    content: (
                      <>
                        <LiveMatchResults liveMatchId={liveMatchId} showCards />
                      </>
                    ),
                  })
                })
              }}
            >
              Show Cards
            </ActionButton>
          )}
        </div>
        <div className="grid grid-cols-[auto_auto] md:grid-cols-[auto_1fr_auto_auto] gap-2 items-center justify-center">
          {participations.map((p) => {
            return (
              <Fragment key={p.id}>
                <div>
                  <div className="font-sans">
                    <span>{p.rank}</span>
                    <span className="ordinal">{getOrdinalSuffix(p.rank)}</span>
                  </div>
                </div>
                <div className="max-md:text-right truncate">
                  {getUserName({ user: p.user })}
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <GameMatchBoard game={p.game} showScore />
                  <div className="hidden xl:flex flex-col -mx-6 scale-50">
                    <LeaderboardRankCardByGame gameId={p.game.id} tiny />
                  </div>
                </div>
                <div className="text-right font-bold">{p.score}&nbsp;Pt.</div>
                {showCards && (
                  <div className="col-span-2 md:col-span-4 pb-2 mb-2 border-b">
                    <ItemCardGrid
                      items={p.loadout.data.items}
                      size="80"
                      className="justify-start"
                    />
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </Card>
    </>
  )
}
