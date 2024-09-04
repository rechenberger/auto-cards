import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { nullThemeId } from '@/game/themes'
import { fetchTeampilot } from '@teampilot/sdk'
import { first } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { AiImageProps } from './AiImage'

export const generateAiImage = async ({
  prompt,
  itemId,
  themeId,
  force = true,
}: AiImageProps & { force?: boolean }) => {
  'use server'
  await throwIfNotAdmin({ allowDev: true })
  const { url } = await generateImage({ prompt, force })
  await db.insert(schema.aiImage).values({
    prompt,
    url,
    itemId,
    themeId: themeId ? (themeId === nullThemeId ? null : themeId) : null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  })
  revalidatePath('/', 'layout')
}

const generateImage = async ({
  prompt,
  force,
}: {
  prompt: string
  force?: boolean
}) => {
  const response = await fetchTeampilot({
    message: `Generate an image: ${prompt}`,
    launchpadSlugId: process.env.LAUNCHPAD_IMAGES,
    cacheTtlSeconds: force ? 0 : 'forever',
  })
  const media = first(response.mediaAttachments)
  if (media?.type !== 'IMAGE') {
    throw new Error('Failed to generate image')
  }
  return {
    url: media.url,
  }
}
