import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Game, Match } from '@/db/schema-zod'
import { generateMatch } from '@/game/generateMatch'
import { eq } from 'drizzle-orm'
import { MatchReportDisplay } from './MatchReportDisplay'

export const MatchView = async ({
  game,
  match,
}: {
  game: Game
  match: Match
}) => {
  const participants = await db.query.matchParticipation.findMany({
    where: eq(schema.matchParticipation.matchId, match.id),
    with: {
      loadout: true,
    },
  })

  const matchReport = await generateMatch({
    participants: participants.map((p) => ({ loadout: p.loadout.data })),
    seed: [match.data.seed],
  })

  return (
    <>
      <MatchReportDisplay matchReport={matchReport} />
    </>
  )
}
