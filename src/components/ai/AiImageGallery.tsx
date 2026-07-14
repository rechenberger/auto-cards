'use client'

import { useActivateAiImage, useAiImages } from '@/client/api/aiImages'
import { useMeta } from '@/client/api/catalog'
import { tryGetItemByName } from '@/game/allItems'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { Check, LoaderCircle } from 'lucide-react'
import { NewImageButton } from './NewImageButton'
import { AiImageProps } from './AiImage'

export type AiImageGalleryProps = AiImageProps & {
  tiny?: boolean
  cols?: 3 | 4
  limit?: number
}

export const AiImageGallery = ({
  itemId,
  prompt,
  className,
  themeId,
  tiny,
  cols = 3,
  limit,
}: AiImageGalleryProps) => {
  const query = useAiImages({ itemId, prompt, themeId, limit })
  const activate = useActivateAiImage()
  const meta = useMeta()
  const item = itemId ? tryGetItemByName(itemId) : undefined
  const subtitle = item ? item.prompt || capitalCase(item.name) : prompt
  const images = query.data?.images ?? []
  const active = images[0]

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        tiny &&
          'absolute inset-x-0 bottom-0 z-20 flex-col-reverse gap-2 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:focus-within:opacity-100',
      )}
    >
      <div className={cn('flex items-center gap-2', tiny && 'justify-center')}>
        {!tiny && (
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">AI image gallery</h2>
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          </div>
        )}
        <NewImageButton
          prompt={prompt}
          itemId={itemId}
          themeId={themeId}
          force={Boolean(images.length)}
        />
      </div>

      {query.isPending ? (
        <div
          className="flex min-h-24 items-center justify-center"
          role="status"
        >
          <LoaderCircle
            className="size-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span className="sr-only">Loading image gallery</span>
        </div>
      ) : (
        <div
          className={cn(
            'grid items-start gap-2',
            cols === 3 ? 'grid-cols-3' : 'grid-cols-4',
          )}
        >
          {images.map((image) => {
            const isActive = active?.id === image.id
            return (
              <button
                key={image.id}
                type="button"
                className="relative min-h-11 min-w-11 touch-manipulation rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!meta.data?.viewer?.isAdmin || activate.isPending}
                aria-label={`Use this image${
                  image.prompt !== prompt ? ' with an older prompt' : ''
                }`}
                aria-pressed={isActive}
                onClick={() => void activate.mutateAsync(image.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className={cn(
                    'aspect-square w-full rounded-md object-cover',
                    isActive && 'ring-4 ring-primary',
                    className,
                  )}
                  loading="lazy"
                  decoding="async"
                />
                {isActive && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-primary p-1 text-primary-foreground">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
                {image.prompt !== prompt && (
                  <span
                    className={cn(
                      'absolute right-1 top-1 rounded bg-orange-600 text-xs text-white',
                      tiny ? 'size-3' : 'px-2 py-1',
                    )}
                  >
                    {!tiny && 'Old prompt'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
      {(query.error || activate.error) && (
        <p className="text-xs text-destructive" role="alert">
          {(query.error ?? activate.error)?.message}
        </p>
      )}
    </div>
  )
}
