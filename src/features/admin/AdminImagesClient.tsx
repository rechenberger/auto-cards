'use client'

import { useAiImages } from '@/client/api/aiImages'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Badge } from '@/components/ui/badge'

export const AdminImagesClient = () => {
  const images = useAiImages({ limit: 100 })
  if (images.isPending) return <QueryLoading label="Loading latest images…" />
  if (images.error) {
    return (
      <QueryError error={images.error} retry={() => void images.refetch()} />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {images.data.images.length} latest images
        </h1>
        <p className="text-sm text-muted-foreground">
          Generation and activation are available in the item and background
          galleries.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {images.data.images.map((image) => (
          <a
            key={image.id}
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-11 flex-col gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.prompt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {image.themeId && (
                <Badge className="absolute bottom-2 right-2 capitalize">
                  {image.themeId}
                </Badge>
              )}
            </div>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {image.prompt}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
