import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { fetchTeampilot } from '@teampilot/sdk'
import { eq } from 'drizzle-orm'
import { first } from 'lodash-es'
import { revalidatePath } from 'next/cache'
import { Suspense } from 'react'
import { Skeleton } from '../ui/skeleton'

export const AiImage = ({
  prompt,
  className = 'aspect-square',
  itemId,
}: {
  prompt: string
  className?: string
  itemId?: string
}) => {
  return (
    <>
      <Suspense fallback={<Skeleton className={className} />}>
        <AiImageRaw prompt={prompt} className={className} itemId={itemId} />
      </Suspense>
    </>
  )
}

export const AiImageRaw = async ({
  prompt,
  className,
  itemId,
}: {
  prompt: string
  className?: string
  itemId?: string
}) => {
  const aiImage = await db.query.aiImage.findFirst({
    where: itemId
      ? eq(schema.aiImage.itemId, itemId)
      : eq(schema.aiImage.prompt, prompt),
  })
  if (!aiImage) {
    return (
      <Skeleton
        className={cn(className, 'flex flex-col items-center justify-center')}
      >
        <ActionButton
          catchToast
          variant={'outline'}
          action={async () => {
            'use server'
            const { url } = await generateImage({ prompt })
            await db.insert(schema.aiImage).values({
              prompt,
              url,
              itemId,
            })
            revalidatePath('/', 'layout')
          }}
          title={prompt}
        >
          Generate
        </ActionButton>
      </Skeleton>
    )
  }
  return (
    <>
      <img src={aiImage.url} alt={prompt} className={className} />
    </>
  )
}

const generateImage = async ({ prompt }: { prompt: string }) => {
  const response = await fetchTeampilot({
    message: `Generate an image: ${prompt}`,
    launchpadSlugId: process.env.LAUNCHPAD_IMAGES,
  })
  const media = first(response.mediaAttachments)
  if (media?.type !== 'IMAGE') {
    throw new Error('Failed to generate image')
  }
  return {
    url: media.url,
  }
}
