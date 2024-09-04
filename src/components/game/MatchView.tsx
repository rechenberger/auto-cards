import { Game, Match } from '@/db/schema-zod'
import { generateChangemakers } from '@/game/generateChangemakers'
import { generateMatch } from '@/game/generateMatch'
import { fallbackThemeId } from '@/game/themes'
import { every } from 'lodash-es'
import { AlertCircle, Swords } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { MatchBackground } from './MatchBackground'
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

  const changemakers = await generateChangemakers({ match, participants })

  const themeIds = await Promise.all(
    participants.map((p) => fallbackThemeId(p.user?.themeId)),
  )

  return (
    <>
      <MatchBackground themeIds={themeIds} />
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col xl:flex-row gap-2 flex-1 items-center">
          <div className="hidden xl:flex">
            <MatchCards
              items={participants[0].loadout.data.items}
              sideIdx={0}
              changemakers={changemakers}
              matchReport={matchReport}
              themeId={themeIds[0]}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2 items-center justify-center self-stretch">
            <MatchReportPlaybackControls matchReport={matchReport} />
            <MatchReportDisplayToggle matchReport={matchReport} />
            <div className="flex-1" />
            {!!game && <NextRoundButton game={game} />}
          </div>

          <div className="hidden xl:flex">
            <MatchCards
              items={participants[1].loadout.data.items}
              sideIdx={1}
              changemakers={changemakers}
              matchReport={matchReport}
              themeId={themeIds[1]}
            />
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center relative">
          <div className="max-xl:flex-1 flex flex-col gap-4">
            <MatchSide
              sideIdx={0}
              participant={participants[0]}
              matchReport={matchReport}
            />
            <div className="xl:hidden self-start">
              <MatchCards
                items={participants[0].loadout.data.items}
                sideIdx={0}
                changemakers={changemakers}
                matchReport={matchReport}
                themeId={themeIds[0]}
              />
            </div>
          </div>
          <div className="absolute top-8 z-10">
            <Swords className="size-8 xl:size-16" />
          </div>
          <div className="max-xl:flex-1 flex flex-col gap-4">
            <MatchSide
              sideIdx={1}
              participant={participants[1]}
              matchReport={matchReport}
            />
            <div className="xl:hidden self-end">
              <MatchCards
                items={participants[1].loadout.data.items}
                sideIdx={1}
                changemakers={changemakers}
                matchReport={matchReport}
                themeId={themeIds[1]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
