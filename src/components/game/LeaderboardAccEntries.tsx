import { addToLeaderboardAcc } from '@/game/addToLeaderboardAcc'
import { NO_OF_ROUNDS } from '@/game/config'
import { Fragment } from 'react'
import { Progress } from '../ui/progress'

export const LeaderboardAccEntries = async ({ gameId }: { gameId: string }) => {
  const result = await addToLeaderboardAcc({
    gameId,
    roundNo: NO_OF_ROUNDS - 1,
    dryRun: true,
  })

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 gap-x-4 w-96">
        <div className="font-bold">Round</div>
        <div className="font-bold"></div>
        <div className="font-bold text-right">Score</div>
        <div className="col-span-3 border-b" />
        {result?.entries.map((entry) => (
          <Fragment key={entry.id}>
            <div>{entry.roundNo + 1}</div>
            <Progress value={entry.score} max={100} />
            <div className="text-right font-mono">{entry.score.toFixed(2)}</div>
          </Fragment>
        ))}
        <div className="col-span-3 border-t" />
        <div className="font-bold">Total</div>
        <Progress value={result?.score ?? 0} max={100} />
        <div className="font-bold text-right font-mono">
          {result?.score.toFixed(2)}
        </div>
      </div>
    </>
  )
}
