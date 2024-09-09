import { getMyUserId } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchParticipationData } from '@/db/schema-zod'
import { fightLiveMatch } from '@/game/fightLiveMatch'
import { LiveMatchStuff } from '@/game/getLiveMatchStuff'
import { typedParse } from '@/lib/typedParse'
import { superAction } from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'

export const LiveMatchGameButtons = async ({
  liveMatch,
}: {
  liveMatch: LiveMatchStuff
}) => {
  const userId = await getMyUserId()

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
      {allReady && isHost && liveMatch.liveMatchParticipations.length > 1 ? (
        <>
          <ActionButton
            catchToast
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
            catchToast
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
    </>
  )
}
