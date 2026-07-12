'use client'

import { useActivateAiImage, useAiImages } from '@/client/api/aiImages'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Badge } from '@/components/ui/badge'
import { getMatchBackgroundPrompt } from '@/game/matchBackgroundPrompt'
import { getAllThemes } from '@/game/themes'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { Check } from 'lucide-react'
import { NewImageButton } from '@/components/ai/NewImageButton'

export const AdminBackgroundsClient = () => {
  const query = useAiImages({ itemId: 'match-bg', limit: 500 })
  const activate = useActivateAiImage()
  const themes = getAllThemes()

  if (query.isPending) return <QueryLoading label="Loading backgrounds…" />
  if (query.error) {
    return <QueryError error={query.error} retry={() => void query.refetch()} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Match backgrounds</h1>
        <p className="text-sm text-muted-foreground">
          One API request loads the complete matrix; generation remains one
          durable job per image.
        </p>
      </div>
      {activate.error && <QueryError error={activate.error} />}
      <div className="overflow-auto rounded-lg border">
        <div
          className="grid w-max min-w-full gap-px bg-border"
          style={{
            gridTemplateColumns: `10rem repeat(${themes.length}, minmax(16rem, 1fr))`,
          }}
        >
          <div className="sticky left-0 top-0 z-20 bg-background p-3 font-semibold">
            Themes
          </div>
          {themes.map((theme) => (
            <div
              key={theme.name}
              className="sticky top-0 z-10 bg-background p-3 text-center font-semibold"
            >
              {capitalCase(theme.name)}
            </div>
          ))}
          {themes.flatMap((leftTheme) => [
            <div
              key={`${leftTheme.name}-label`}
              className="sticky left-0 z-10 flex items-center bg-background p-3 font-semibold"
            >
              {capitalCase(leftTheme.name)}
            </div>,
            ...themes.map((rightTheme) => {
              const themeId = `${leftTheme.name}~${rightTheme.name}`
              const prompt = getMatchBackgroundPrompt([
                leftTheme.name,
                rightTheme.name,
              ])
              const candidates = query.data.images.filter(
                (image) => image.themeId === themeId,
              )
              const active = candidates[0]
              return (
                <div
                  key={themeId}
                  className="flex min-h-64 flex-col gap-3 bg-background p-3"
                >
                  <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                    {active ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={active.url}
                        alt={`${capitalCase(leftTheme.name)} and ${capitalCase(
                          rightTheme.name,
                        )} match background`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No background yet
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidates.slice(0, 8).map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        className={cn(
                          'relative size-12 touch-manipulation overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          image.id === active?.id && 'ring-2 ring-primary',
                        )}
                        aria-label="Activate background variant"
                        aria-pressed={image.id === active?.id}
                        disabled={activate.isPending}
                        onClick={() => void activate.mutateAsync(image.id)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        {image.id === active?.id && (
                          <Badge className="absolute bottom-0 left-0 p-1">
                            <Check className="size-3" aria-hidden="true" />
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                  <NewImageButton
                    prompt={prompt}
                    itemId="match-bg"
                    themeId={themeId}
                    force={Boolean(candidates.length)}
                  />
                </div>
              )
            }),
          ])}
        </div>
      </div>
    </div>
  )
}
