import { LoginForm } from '@/auth/LoginForm'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'

export const CreateUserButton = () => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            streamDialog({
              title: 'Create User',
              content: (
                <>
                  <LoginForm
                    onSubmit={async (credentials) => {
                      'use server'
                      const existingUser = await db.query.users.findFirst({
                        where: (s, { eq }) => eq(s.email, credentials.email),
                      })
                      if (existingUser) {
                        throw new Error('User already exists')
                      }

                      const passwordHash = await bcrypt.hash(
                        credentials.password,
                        10,
                      )

                      await db.insert(schema.users).values({
                        id: crypto.randomUUID(),
                        email: credentials.email,
                        passwordHash,
                      })

                      revalidatePath('/users')
                    }}
                  />
                </>
              ),
            })
          })
        }}
      >
        Create User
      </ActionButton>
    </>
  )
}
