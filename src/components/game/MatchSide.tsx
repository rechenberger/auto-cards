import { getBotName } from '@/game/botName'
import { MatchReport } from '@/game/generateMatch'
import { cn } from '@/lib/utils'
import { MatchParticipant } from './MatchParticipants'
import { MatchStatsDisplay } from './MatchStatsDisplay'

export const MatchSide = ({
  sideIdx,
  participant,
  matchReport,
}: {
  sideIdx: number
  participant: MatchParticipant
  matchReport: MatchReport
}) => {
  const isEnemy = sideIdx === 1
  const name =
    participant.user?.name ||
    participant.user?.email ||
    getBotName({ seed: participant.loadout.id })

  return (
    <>
      <div
        className={cn(
          'flex flex-row gap-4 justify-start',
          isEnemy && 'flex-row-reverse',
          'w-60',
          'p-4 rounded-xl',
          isEnemy ? 'bg-blue-500/20' : 'bg-red-500/20',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-2',
            isEnemy ? 'items-end' : 'items-start',
          )}
        >
          <div className="text-lg font-bold">{name}</div>
          <MatchStatsDisplay matchReport={matchReport} sideIdx={sideIdx} />
        </div>
        {/* <MatchCards items={participant.loadout.data.items} /> */}
      </div>
    </>
  )
}
