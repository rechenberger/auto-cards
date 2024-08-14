import { fetchTeampilot } from '@teampilot/sdk'
import { first } from 'lodash-es'
import { Suspense } from 'react'
import { Skeleton } from '../ui/skeleton'

export const AiImage = ({
  prompt,
  className = 'aspect-square',
}: {
  prompt: string
  className?: string
}) => {
  return (
    <>
      <Suspense fallback={<Skeleton className={className} />}>
        <AiImageRaw prompt={prompt} className={className} />
      </Suspense>
    </>
  )
}

export const AiImageRaw = async ({
  prompt,
  className,
}: {
  prompt: string
  className?: string
}) => {
  const response = await fetchTeampilot({
    message: `Generate an image: ${prompt}`,
    launchpadSlugId: process.env.LAUNCHPAD_IMAGES,
  })
  const media = first(response.mediaAttachments)
  if (media?.type !== 'IMAGE') {
    throw new Error('Failed to generate image')
  }
  return (
    <>
      <img src={media.url} alt={prompt} className={className} />
    </>
  )
}
