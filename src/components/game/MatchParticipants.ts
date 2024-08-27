import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { orderBy } from 'lodash-es'

export const getMatchParticipants = async ({
  matchId,
}: {
  matchId: string
}) => {
  let participants = await db.query.matchParticipation.findMany({
    where: eq(schema.matchParticipation.matchId, matchId),
    with: {
      loadout: true,
      user: true,
    },
  })
  participants = orderBy(participants, (p) => p.sideIdx, 'asc')
  return participants
}

export type MatchParticipant = Awaited<
  ReturnType<typeof getMatchParticipants>
>[number]
