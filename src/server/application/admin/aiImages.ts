import { AiImageCommand, AiImageDto } from '@/contracts/ai-images'
import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { Job } from '@/db/schema-zod'
import { getAllItems, getItemByName } from '@/game/allItems'
import { GAME_VERSION } from '@/game/config'
import { getItemAiImagePrompt } from '@/game/itemAiImagePrompt'
import { getAllThemes, getThemeDefinition, nullThemeId } from '@/game/themes'
import { enqueueJob, enqueueJobs } from '@/server/jobs/queue'
import { fetchTeampilot } from '@teampilot/sdk'
import { and, desc, eq, isNull, SQL } from 'drizzle-orm'
import { first } from 'lodash-es'

export const AI_IMAGE_GENERATION_JOB = 'admin.ai-image-generation'

const normalizeThemeId = (themeId?: string | null) =>
  themeId === nullThemeId ? null : themeId

export const findAiImages = async ({
  itemId,
  themeId,
  prompt,
  limit = 12,
}: {
  itemId?: string
  themeId?: string | null
  prompt?: string
  limit?: number
}) => {
  const filters: SQL[] = []
  if (itemId) filters.push(eq(schema.aiImage.itemId, itemId))
  if (themeId !== undefined) {
    const normalized = normalizeThemeId(themeId) as string | null
    filters.push(
      normalized === null
        ? isNull(schema.aiImage.themeId)
        : eq(schema.aiImage.themeId, normalized),
    )
  }
  if (prompt && !itemId) filters.push(eq(schema.aiImage.prompt, prompt))

  return db.query.aiImage.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: desc(schema.aiImage.updatedAt),
    limit,
  })
}

const generateImage = async ({
  prompt,
  force,
}: {
  prompt: string
  force: boolean
}) => {
  const response = await fetchTeampilot({
    message: `Generate an image: ${prompt}`,
    launchpadSlugId: process.env.LAUNCHPAD_IMAGES,
    cacheTtlSeconds: force ? 0 : 'forever',
  })
  const media = first(response.mediaAttachments)
  if (media?.type !== 'IMAGE')
    throw new Error('Image provider returned no image')
  return media.url
}

export const generateAiImageNow = async ({
  prompt,
  itemId,
  themeId,
  force,
}: {
  prompt: string
  itemId?: string
  themeId?: string
  force: boolean
}) => {
  const now = new Date().toISOString()
  const inserted = await db
    .insert(schema.aiImage)
    .values({
      prompt,
      url: await generateImage({ prompt, force }),
      itemId: itemId ?? null,
      themeId: normalizeThemeId(themeId) ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .then(first)
  if (!inserted) throw new Error('Generated image could not be persisted')
  return AiImageDto.parse(inserted)
}

const imageJobInput = ({
  prompt,
  itemId,
  themeId,
  force,
  requestedBy,
  requestKey,
  suffix,
}: {
  prompt: string
  itemId?: string
  themeId?: string
  force: boolean
  requestedBy: string
  requestKey: string
  suffix: string | number
}) => ({
  type: AI_IMAGE_GENERATION_JOB,
  payload: { prompt, itemId, themeId, force, requestedBy },
  idempotencyKey: `${AI_IMAGE_GENERATION_JOB}:${requestedBy}:${requestKey}:${suffix}`,
})

export const enqueueAiImageCommand = async ({
  command,
  requestedBy,
  requestKey,
}: {
  command: AiImageCommand
  requestedBy: string
  requestKey: string
}) => {
  if (command.type === 'generate') {
    const jobs = await Promise.all(
      Array.from({ length: command.count }, (_, index) =>
        enqueueJob(
          imageJobInput({
            prompt: command.prompt,
            itemId: command.itemId,
            themeId: command.themeId,
            force: command.force,
            requestedBy,
            requestKey,
            suffix: index,
          }),
        ),
      ),
    )
    return { jobs, skipped: 0 }
  }

  const items = command.itemId
    ? [getItemByName(command.itemId, GAME_VERSION)]
    : getAllItems(GAME_VERSION)
  const themes = command.themeId
    ? [getThemeDefinition(command.themeId)]
    : getAllThemes()

  const existingImages = await findAiImages({
    itemId: command.itemId,
    themeId: command.themeId,
    limit: 50_000,
  })
  const existingByCombination = new Map<
    string,
    (typeof existingImages)[number]
  >()
  for (const image of existingImages) {
    if (!image.itemId || !image.themeId) continue
    const key = `${image.itemId}\u0000${image.themeId}`
    if (!existingByCombination.has(key)) existingByCombination.set(key, image)
  }

  const jobInputs: ReturnType<typeof imageJobInput>[] = []
  let skipped = 0
  for (const item of items) {
    for (const theme of themes) {
      const prompt = getItemAiImagePrompt({
        name: item.name,
        themeId: theme.name,
      })
      const existing = existingByCombination.get(
        `${item.name}\u0000${theme.name}`,
      )
      const shouldGenerate =
        command.mode === 'all' ||
        (command.mode === 'missing' && !existing) ||
        (command.mode === 'prompt' && existing?.prompt !== prompt)
      if (!shouldGenerate) {
        skipped += 1
        continue
      }
      jobInputs.push(
        imageJobInput({
          prompt,
          itemId: item.name,
          themeId: theme.name,
          force: Boolean(existing) || command.mode === 'all',
          requestedBy,
          requestKey,
          suffix: `${item.name}:${theme.name}`,
        }),
      )
    }
  }
  return { jobs: await enqueueJobs(jobInputs), skipped }
}

export const processAiImageJob = async (job: Job) => {
  const prompt = job.payload.prompt
  const itemId = job.payload.itemId
  const themeId = job.payload.themeId
  const force = job.payload.force
  if (typeof prompt !== 'string' || typeof force !== 'boolean') {
    throw new Error('Invalid AI image job payload')
  }
  await generateAiImageNow({
    prompt,
    force,
    itemId: typeof itemId === 'string' ? itemId : undefined,
    themeId: typeof themeId === 'string' ? themeId : undefined,
  })
}
