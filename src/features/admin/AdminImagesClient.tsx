'use client'

import { useAiImages } from '@/client/api/aiImages'
import { QueryError, QueryLoading } from '@/components/api/QueryState'

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
      <h1 className="text-2xl font-semibold">
        {images.data.images.length} latest images
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {images.data.images.map((image) => (
          <a
            key={image.id}
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <span className="absolute bottom-4 right-4 rounded-full bg-black px-2 py-1 text-sm capitalize text-white">
                  {image.themeId}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
