import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'

export const LiveMatchCard = async ({
  liveMatchId,
}: {
  liveMatchId: string
}) => {
  const liveMatch = await db.query.liveMatch.findFirst({
    where: eq(schema.liveMatch.id, liveMatchId),
    with: {
      liveMatchParticipations: {
        with: {
          user: true,
        },
      },
    },
  })
  if (!liveMatch) return null

  return (
    <>
      <div>Live Match</div>
      <div>
        {liveMatch.liveMatchParticipations.map((participation) => (
          <div key={participation.id}>
            {participation.user.name}{' '}
            {participation.data.ready ? 'Ready' : 'Not Ready'}
          </div>
        ))}
      </div>
    </>
  )
}
