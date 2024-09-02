import { getMyUserId } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchParticipationData } from '@/db/schema-zod'
import { fightLiveMatch } from '@/game/fightLiveMatch'
import { typedParse } from '@/lib/typedParse'
import { cn } from '@/lib/utils'
import { superAction } from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { SimpleRefresher } from '../simple/SimpleRefresher'
import { Card } from '../ui/card'

export const LiveMatchCard = async ({
  liveMatchId,
}: {
  liveMatchId: string
}) => {
  const userId = await getMyUserId()
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

  const myParticipation = userId
    ? liveMatch.liveMatchParticipations.find(
        (participation) => participation.user.id === userId,
      )
    : undefined

  const allReady = liveMatch.liveMatchParticipations.every(
    (participation) => participation.data.ready,
  )

  const isHost = myParticipation?.data.isHost

  return (
    <>
      <Card className="flex flex-col gap-2 p-2 w-56">
        <div className="flex flex-row gap-2 items-baseline">
          <div className="flex-1">⚡ Live Match</div>
          <SimpleRefresher
            forceState={true}
            ms={myParticipation?.data.ready ? 1000 : 4000}
          />
        </div>
        <div>
          {liveMatch.liveMatchParticipations.map((participation) => (
            <div
              key={participation.id}
              className={cn(
                'flex flex-row gap-2',
                participation.data.ready && 'text-green-500',
              )}
            >
              <div className="flex-1">
                {participation.user.name}
                {participation.data.isHost && ' (Host)'}
              </div>
              <div className="text-right">
                {participation.data.ready ? 'Ready' : 'Not Ready'}
              </div>
            </div>
          ))}
        </div>
        {allReady && isHost && liveMatch.liveMatchParticipations.length > 1 ? (
          <>
            <ActionButton
              action={async () => {
                'use server'
                return superAction(async () => {
                  await db
                    .update(schema.liveMatch)
                    .set({
                      status: 'locked',
                    })
                    .where(eq(schema.liveMatch.id, liveMatch.id))
                  await fightLiveMatch({ liveMatchId: liveMatch.id })
                  streamRevalidatePath('/', 'layout')
                })
              }}
            >
              Start Matches
            </ActionButton>
          </>
        ) : myParticipation && !myParticipation.data.ready ? (
          <>
            <ActionButton
              action={async () => {
                'use server'
                return superAction(async () => {
                  await db
                    .update(schema.liveMatchParticipation)
                    .set({
                      data: typedParse(LiveMatchParticipationData, {
                        ...myParticipation.data,
                        ready: true,
                      }),
                    })
                    .where(
                      eq(schema.liveMatchParticipation.id, myParticipation.id),
                    )
                  streamRevalidatePath('/', 'layout')
                })
              }}
            >
              Ready up!
            </ActionButton>
          </>
        ) : null}
      </Card>
    </>
  )
}
