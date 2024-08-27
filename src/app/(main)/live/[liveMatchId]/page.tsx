import { getMyUserIdOrLogin } from '@/auth/getMyUser'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'
import { ActionButton } from '@/super-action/button/ActionButton'
import { eq } from 'drizzle-orm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Live Match',
}

export default async function Page({
  params: { liveMatchId },
}: {
  params: { liveMatchId: string }
}) {
  const userId = await getMyUserIdOrLogin()

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

  if (!liveMatch) {
    return notFound()
  }

  const isParticipating = liveMatch.liveMatchParticipations.some(
    (participation) => participation.user.id === userId,
  )

  return (
    <>
      <h1>Live Match</h1>
      <div>
        {liveMatch.liveMatchParticipations.map((participation) => (
          <div key={participation.id}>{participation.user.name}</div>
        ))}
      </div>
      {!isParticipating && (
        <ActionButton
          action={async () => {
            'use server'
            return superAction(async () => {
              await db.insert(schema.liveMatchParticipation).values({
                liveMatchId: liveMatch.id,
                userId: userId,
                data: {},
              })
              streamToast({
                title: 'Joined Match',
                description: 'You have joined the match',
              })
              streamRevalidatePath(`/live/${liveMatch.id}`)
            })
          }}
        >
          Join Match
        </ActionButton>
      )}
    </>
  )
}
