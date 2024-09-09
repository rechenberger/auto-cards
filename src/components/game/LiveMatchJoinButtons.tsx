import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchParticipationData } from '@/db/schema-zod'
import { createGame } from '@/game/createGame'
import { LiveMatchStuff } from '@/game/getLiveMatchStuff'
import { typedParse } from '@/lib/typedParse'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export const LiveMatchJoinButtons = async ({
  liveMatch,
}: {
  liveMatch: LiveMatchStuff
}) => {
  const liveMatchId = liveMatch.id
  const userId = await getMyUserIdOrLogin()

  const isParticipating = liveMatch.liveMatchParticipations.some(
    (participation) => participation.user.id === userId,
  )

  const myGame = await db.query.game.findFirst({
    where: and(
      eq(schema.game.userId, userId),
      eq(schema.game.liveMatchId, liveMatchId),
    ),
  })

  return (
    <>
      {!isParticipating ? (
        <ActionButton
          catchToast
          disabled={liveMatch.status !== 'open'}
          action={async () => {
            'use server'
            return superAction(async () => {
              const liveMatch = await db.query.liveMatch.findFirst({
                where: eq(schema.liveMatch.id, liveMatchId),
              })
              if (!liveMatch || liveMatch.status !== 'open') {
                throw new Error('Live match is not open')
              }
              await db.insert(schema.liveMatchParticipation).values({
                liveMatchId: liveMatch.id,
                userId: userId,
                data: typedParse(LiveMatchParticipationData, {}),
              })
              streamToast({
                title: 'Joined Match',
                description: 'You have joined the match',
              })
              streamRevalidatePath(`/live/${liveMatch.id}`)
            })
          }}
        >
          {liveMatch.status === 'open' ? 'Join Match' : 'Match is closed'}
        </ActionButton>
      ) : myGame ? (
        <ActionButton
          action={async () => {
            'use server'
            return superAction(async () => {
              redirect(`/game/${myGame.id}`)
            })
          }}
        >
          Resume Game
        </ActionButton>
      ) : (
        <ActionButton
          catchToast
          action={async () => {
            'use server'
            return superAction(async () => {
              const myGame = await createGame({
                userId,
                liveMatch: liveMatch,
              })
              redirect(`/game/${myGame.id}`)
            })
          }}
        >
          Start Game
        </ActionButton>
      )}
    </>
  )
}
