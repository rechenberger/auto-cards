import { ButtonProps } from '@/components/ui/button'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { LiveMatchData } from '@/db/schema-zod'
import { typedParse } from '@/lib/typedParse'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { first } from 'lodash-es'
import { redirect } from 'next/navigation'

export const NewLiveMatchButton = ({
  variant,
}: {
  variant?: ButtonProps['variant']
}) => {
  return (
    <ActionButton
      variant={variant}
      hideIcon
      action={async () => {
        'use server'

        return superAction(async () => {
          const liveMatch = await db
            .insert(schema.liveMatch)
            .values({
              data: typedParse(LiveMatchData, {}),
            })
            .returning()
            .then(first)

          if (!liveMatch) {
            throw new Error('Failed to create live match')
          }

          redirect(`/live/${liveMatch.id}`)
        })
      }}
    >
      New Live Match
    </ActionButton>
  )
}
