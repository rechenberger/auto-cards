import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ChangeUsernameFormClient } from './ChangeUsernameFormClient'
import { getMyUser, getMyUserIdOrThrow } from './getMyUser'
import { revalidateUserCache } from './user-cache'

export const ChangeUsernameForm = async ({
  redirectUrl,
}: {
  redirectUrl?: string
}) => {
  const user = await getMyUser()
  return (
    <>
      <ChangeUsernameFormClient
        action={async (data) => {
          'use server'
          return superAction(async () => {
            const userId = await getMyUserIdOrThrow()
            await db
              .update(schema.users)
              .set({
                name: data.username,
              })
              .where(eq(schema.users.id, userId))
              .execute()

            const description = redirectUrl
              ? 'Redirecting...'
              : 'Your username has been changed'

            revalidateUserCache()

            streamToast({
              title: 'Username Changed!',
              description,
            })

            if (redirectUrl) {
              await new Promise((res) => setTimeout(res, 2000))
            }
            redirect(redirectUrl || '/')
          })
        }}
        username={user?.name ?? undefined}
        redirectUrl={redirectUrl}
      />
    </>
  )
}
