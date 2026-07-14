import { sendDiscordMessage } from '@/lib/discord'
import { enqueueJob } from './queue'

export const DISCORD_NOTIFICATION_JOB = 'notification.discord'

export const enqueueDiscordNotification = async ({
  idempotencyKey,
  content,
}: {
  idempotencyKey: string
  content: string
}) =>
  enqueueJob({
    type: DISCORD_NOTIFICATION_JOB,
    payload: { content },
    idempotencyKey: `${DISCORD_NOTIFICATION_JOB}:${idempotencyKey}`,
  })

export const processDiscordNotification = async (
  payload: Record<string, unknown>,
) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return
  if (typeof payload.content !== 'string') {
    throw new Error('Discord notification is missing content')
  }
  await sendDiscordMessage({ content: payload.content })
}
