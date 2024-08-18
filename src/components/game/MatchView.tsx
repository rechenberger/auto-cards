import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game, Match } from '@/db/schema-zod'
import { generateMatch } from '@/game/generateMatch'
import { eq } from 'drizzle-orm'
import { orderBy } from 'lodash-es'
import { LoadoutDisplay } from './LoadoutDisplay'
import { MatchReportDisplay } from './MatchReportDisplay'
import { NextRoundButton } from './NextRoundButton'

export const MatchView = async ({
  game,
  match,
}: {
  game?: Game
  match: Match
}) => {
  let participants = await db.query.matchParticipation.findMany({
    where: eq(schema.matchParticipation.matchId, match.id),
    with: {
      loadout: true,
    },
  })
  participants = orderBy(participants, (p) => p.sideIdx, 'asc')

  const matchReport = await generateMatch({
    participants: participants.map((p) => ({ loadout: p.loadout.data })),
    seed: [match.data.seed],
  })

  return (
    <>
      <div className="rotate-180">
        <LoadoutDisplay loadout={participants[1].loadout.data} />
      </div>
      <div className="max-h-96 overflow-scroll">
        <MatchReportDisplay matchReport={matchReport} />
      </div>
      <LoadoutDisplay loadout={participants[0].loadout.data} />
      {!!game && <NextRoundButton game={game} />}
    </>
  )
}
