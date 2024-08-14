import { fetchTeampilot } from '@teampilot/sdk'
import { first } from 'lodash-es'
import { Suspense } from 'react'

export const AiImage = (props: { prompt: string; className?: string }) => {
  return (
    <>
      <Suspense fallback={`Loading ${props.prompt}`}>
        <AiImageRaw {...props} />
      </Suspense>
    </>
  )
}

export const AiImageRaw = async ({ prompt }: { prompt: string }) => {
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
      <img src={media.url} alt={prompt} />
    </>
  )
}
