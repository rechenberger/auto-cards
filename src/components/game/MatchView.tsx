import { Game, Match } from '@/db/schema-zod'
import { generateMatch } from '@/game/generateMatch'
import { every } from 'lodash-es'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { MatchCards } from './MatchCards'
import { getMatchParticipants } from './MatchParticipants'
import { MatchReportDisplayToggle } from './MatchReportDisplayToggle'
import { MatchReportPlaybackControls } from './MatchReportPlaybackControls'
import { MatchSide } from './MatchSide'
import { NextRoundButton } from './NextRoundButton'

export const MatchView = async ({
  game,
  match,
}: {
  game?: Game
  match: Match
}) => {
  const participants = await getMatchParticipants({ matchId: match.id })
  if (participants.length !== 2 || !every(participants, (p) => p.loadout)) {
    return (
      <>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Old Match</AlertTitle>
          <AlertDescription>
            Game has changed too much to replay this match
          </AlertDescription>
        </Alert>
        {!!game && <NextRoundButton game={game} />}
      </>
    )
  }

  const matchReport = await generateMatch({
    participants: participants.map((p) => ({ loadout: p.loadout.data })),
    seed: [match.data.seed],
  })

  return (
    <>
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-row gap-2 flex-1 items-end">
          <MatchCards items={participants[0].loadout.data.items} sideIdx={0} />
          <div className="flex-1 flex flex-col gap-2 items-center justify-center self-start">
            <MatchReportPlaybackControls matchReport={matchReport} />
            <MatchReportDisplayToggle matchReport={matchReport} />
            {!!game && <NextRoundButton game={game} />}
          </div>
          <MatchCards items={participants[1].loadout.data.items} sideIdx={1} />
        </div>
        <div className="flex flex-row gap-2 justify-center">
          <MatchSide
            sideIdx={0}
            participant={participants[0]}
            matchReport={matchReport}
          />
          <MatchSide
            sideIdx={1}
            participant={participants[1]}
            matchReport={matchReport}
          />
        </div>
      </div>
    </>
  )
}
