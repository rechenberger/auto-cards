'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { AiImageGalleryItem } from '@/components/ai/AiImageGalleryItem'
import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { TagDisplay } from '@/components/game/TagDisplay'
import { Button } from '@/components/ui/button'
import { allRarities, Rarity } from '@/game/rarities'
import { ItemName } from '@/game/allItems'
import { allTags, Tag } from '@/game/tags'
import { ThemeId } from '@/game/themeSchema'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { capitalCase } from 'change-case'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export const DocsItemsClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meta = useMeta()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>()
  const catalog = useCatalog(selectedTheme ?? meta.data?.viewer?.themeId)

  if (meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading items…" />
  }
  if (meta.error || catalog.error || !catalog.data) {
    return (
      <QueryError
        error={meta.error ?? catalog.error}
        retry={() => {
          meta.refetch()
          catalog.refetch()
        }}
      />
    )
  }

  const tag = searchParams.get('tag')
  const rarity = searchParams.get('rarity')
  const parsedTag = Tag.safeParse(tag).data
  const parsedRarity = Rarity.safeParse(rarity).data
  const items = catalog.data.items.filter(
    (item) =>
      (!parsedTag || item.tags?.includes(parsedTag)) &&
      (!parsedRarity || item.rarity === parsedRarity),
  )

  const updateFilter = (key: 'tag' | 'rarity', value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`/docs/items?${next.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <h1 className="flex-1 text-xl font-bold tabular-nums">
          {items.length} Items
        </h1>
        {meta.data?.viewer?.isAdmin && (
          <GenerateAllImagesButton themeId={catalog.data.imageThemeId} />
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span>Tag</span>
          <select
            className="min-h-11 rounded-md border bg-background px-3 text-base"
            value={parsedTag ?? ''}
            onChange={(event) => updateFilter('tag', event.target.value)}
          >
            <option value="">All tags</option>
            {allTags.map((itemTag) => (
              <option key={itemTag} value={itemTag}>
                {capitalCase(itemTag)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Rarity</span>
          <select
            className="min-h-11 rounded-md border bg-background px-3 text-base"
            value={parsedRarity ?? ''}
            onChange={(event) => updateFilter('rarity', event.target.value)}
          >
            <option value="">All rarities</option>
            {allRarities.map((itemRarity) => (
              <option key={itemRarity} value={itemRarity}>
                {capitalCase(itemRarity)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Artwork theme</span>
          <select
            className="min-h-11 rounded-md border bg-background px-3 text-base"
            value={selectedTheme ?? catalog.data.imageThemeId}
            onChange={(event) =>
              setSelectedTheme(ThemeId.parse(event.target.value))
            }
          >
            {catalog.data.themes
              .filter((theme) => !theme.hidden || meta.data?.viewer?.isAdmin)
              .map((theme) => (
                <option key={theme.name} value={theme.name}>
                  {capitalCase(theme.name)}
                </option>
              ))}
          </select>
        </label>
      </div>

      {parsedTag && (
        <div className="text-sm text-muted-foreground">
          Showing <TagDisplay tag={parsedTag} disableLinks /> items
        </div>
      )}

      <div className="flex flex-row flex-wrap justify-center gap-4">
        {items.map((item) => (
          <div key={item.name} className="flex flex-col items-center gap-2">
            <div className="relative">
              <ItemCardClient
                itemData={{ name: ItemName.parse(item.name) }}
                catalog={catalog.data}
                size="320"
                showPrice
              />
              {meta.data?.viewer?.isAdmin && (
                <AiImageGalleryItem
                  itemId={item.name}
                  themeId={catalog.data.imageThemeId}
                  className="rounded-md"
                  tiny
                />
              )}
            </div>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/docs/items/${encodeURIComponent(item.name)}`}>
                View {capitalCase(item.name)}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
