import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/super-action/button/ActionButton'
import { desc, eq } from 'drizzle-orm'
import { Suspense } from 'react'
import { Skeleton } from '../ui/skeleton'
import { generateAiImage } from './generateAiImage.action'

export type AiImageProps = {
  prompt: string
  className?: string
  itemId?: string
}

export const AiImage = ({
  prompt,
  className = 'aspect-square',
  itemId,
}: AiImageProps) => {
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
    orderBy: desc(schema.aiImage.updatedAt),
  })
  if (!aiImage) {
    return (
      <div
        className={cn(className, 'flex flex-col items-center justify-center')}
      >
        <ActionButton
          catchToast
          variant={'outline'}
          action={async () => {
            'use server'
            return generateAiImage({ prompt, itemId, force: false })
          }}
          title={prompt}
        >
          Generate
        </ActionButton>
      </div>
    )
  }
  return (
    <>
      <ActionButton
        catchToast
        variant={'outline'}
        action={async () => {
          'use server'
          return generateAiImage({ prompt, itemId })
        }}
        title={prompt}
        command={{
          label: `Generate Image for ${itemId || prompt}`,
        }}
        hideButton
      >
        Generate
      </ActionButton>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={aiImage.url} alt={prompt} className={className} />
    </>
  )
}
