'use client'

import { useAiImages } from '@/client/api/aiImages'
import { useMeta } from '@/client/api/catalog'
import { cn } from '@/lib/utils'
import { NewImageButton } from './NewImageButton'

export type AiImageProps = {
  prompt: string
  className?: string
  itemId?: string
  themeId?: string
}

export const AiImage = ({
  prompt,
  className = 'aspect-square',
  itemId,
  themeId,
}: AiImageProps) => {
  const images = useAiImages({ prompt, itemId, themeId, limit: 1 })
  const meta = useMeta()

  if (images.isPending) {
    return (
      <div
        className={cn(
          'animate-pulse bg-muted motion-reduce:animate-none',
          className,
        )}
        role="status"
        aria-label="Loading image"
      />
    )
  }

  const image = images.data?.images[0]
  if (!image) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-muted p-2',
          className,
        )}
      >
        {meta.data?.viewer?.isAdmin ? (
          <NewImageButton
            prompt={prompt}
            itemId={itemId}
            themeId={themeId}
            force={false}
          />
        ) : (
          <span className="sr-only">No image available</span>
        )}
        {images.error && (
          <span className="text-xs text-destructive" role="alert">
            {images.error.message}
          </span>
        )}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={prompt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}

export const AiImageRaw = AiImage
