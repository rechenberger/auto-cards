import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { addToLeaderboardAcc } from '@/game/addToLeaderboardAcc'
import { NO_OF_ROUNDS } from '@/game/config'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { eq } from 'drizzle-orm'
import { Fragment } from 'react'
import { Progress } from '../ui/progress'
import { GameMatchBoardSingle } from './GameMatchBoard'

export const LeaderboardAccCalculation = async ({
  gameId,
  roundNo = NO_OF_ROUNDS - 1,
}: {
  gameId: string
  roundNo?: number
}) => {
  const result = await addToLeaderboardAcc({
    gameId,
    roundNo,
    dryRun: true,
  })

  const loadouts = await db.query.loadout.findMany({
    where: eq(schema.loadout.gameId, gameId),
    with: {
      primaryMatchParticipation: true,
    },
  })

  return (
    <>
      <p className="text-sm opacity-60 max-sm:text-xs">
        For the overall score, the win-rate of each round against the Top 50
        Leaderboard of that round is weighted by the round number. This means
        that the win-rate of round 10 is 10 times more important than the
        win-rate of round 1.
      </p>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 gap-x-4 items-center max-sm:text-xs">
        <div className="font-bold">Round</div>
        <div className="font-bold"></div>
        <div className="font-bold text-right">Win-Rate</div>
        <div className="font-bold text-right opacity-60">Weight</div>
        <div className="font-bold text-right">Points</div>
        <div className="col-span-5 border-b" />
        {result?.entries.map((entry) => {
          const loadout = loadouts.find((l) => l.id === entry.loadoutId)
          return (
            <Fragment key={entry.id}>
              <div className="flex flex-row gap-2 items-center">
                <div className="flex-1">{entry.roundNo + 1}</div>
                {loadout && loadout.primaryMatchParticipation && (
                  <GameMatchBoardSingle
                    loadout={loadout}
                    roundNo={entry.roundNo}
                  />
                )}
              </div>
              <Progress
                value={entry.score}
                max={100}
                style={{
                  width: `${100 * entry.weightRelative}%`,
                }}
              />
              <div className="text-right font-mono">
                {entry.score.toFixed(2)}
              </div>
              <div className="text-right font-mono opacity-60">
                x {(entry.weightAbsolute * 100).toFixed(2)}%
              </div>
              <div className="text-right font-mono">
                = {entry.pointsAbsolute.toFixed(2)}
              </div>
            </Fragment>
          )
        })}
        <div className="col-span-5 border-t" />
        <div className="font-bold">Total</div>
        <div className="col-span-3">
          <Progress value={result?.score ?? 0} max={100} />
        </div>
        {/* <div className="text-right font-mono opacity-60">
          {(100).toFixed(2)}
        </div> */}
        <div className="font-bold text-right font-mono">
          {result?.score.toFixed(2)}
        </div>
      </div>
    </>
  )
}

export const streamLeaderboardAccCalculation = async ({
  gameId,
  roundNo,
}: {
  gameId: string | null
  roundNo?: number
}) => {
  return superAction(async () => {
    if (!gameId) {
      return
    }
    streamDialog({
      title: 'Leaderboard Calculation',
      content: (
        <>
          <LeaderboardAccCalculation gameId={gameId} roundNo={roundNo} />
        </>
      ),
    })
  })
}
