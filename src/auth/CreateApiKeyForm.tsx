import {
  streamDialog,
  superAction,
} from '@/super-action/action/createSuperAction'
import { CreateApiKeyFormClient } from './CreateApiKeyFormClient'
import { createAPIKey } from './createAPIKey'
import { getMyUserIdOrThrow } from './getMyUser'
import { CopyButton } from './CopyButton'

export const CreateApiKeyForm = async () => {
  return (
    <>
      <CreateApiKeyFormClient
        action={async (data) => {
          'use server'
          return superAction(async () => {
            const userId = await getMyUserIdOrThrow()
            const apiKey = await createAPIKey({
              expiresAt: data.expiresAt,
              name: data.name,
              userId,
            })

            streamDialog({
              title: 'API Key Created!',
              content: (
                <div className="flex flex-col gap-2">
                  <p>Your API key:</p>
                  <CopyButton
                    text="API key copied to clipboard"
                    value={apiKey.key}
                  />
                  <p>
                    Make sure to save it now, you won&apos;t be able to access
                    it later.
                  </p>
                </div>
              ),
            })
          })
        }}
      />
    </>
  )
}
