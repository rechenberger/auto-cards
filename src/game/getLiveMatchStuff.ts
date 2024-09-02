import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { eq } from 'drizzle-orm'

export type LiveMatchStuff = NonNullable<
  Awaited<ReturnType<typeof getLiveMatchStuff>>
>

export const getLiveMatchStuff = async ({
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
  return liveMatch
}
