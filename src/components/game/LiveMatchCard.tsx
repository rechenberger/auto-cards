import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Card } from '../ui/card'

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
      <Card className="flex flex-col gap-2 p-2 w-56">
        <div className="flex flex-row gap-2 items-baseline">
          <div className="flex-1">⚡ Live Match</div>
          <SimpleRefresher forceState={true} />
        </div>
        <div>
          {liveMatch.liveMatchParticipations.map((participation) => (
            <div key={participation.id} className="flex flex-row gap-2">
              <div className="flex-1">{participation.user.name}</div>
              <div className="text-right">
                {participation.data.ready ? 'Ready' : 'Not Ready'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
