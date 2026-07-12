'use client'

import { useCatalog, useMeta } from '@/client/api/catalog'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { AiImageGalleryItem } from '@/components/ai/AiImageGalleryItem'
import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { StatDescriptions } from '@/components/game/StatDescriptions'
import { ItemDefinition } from '@/game/ItemDefinition'
import { ItemName } from '@/game/allItems'
import { Stat } from '@/game/stats'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { capitalCase } from 'change-case'
import { flatMap, keys, map, uniq } from 'lodash-es'
import Link from 'next/link'

const getItemStats = (item: ItemDefinition) => {
  const triggers = item.triggers ?? []
  const allStats = [
    item.stats,
    item.statsItem,
    ...triggers.flatMap((trigger) => [
      trigger.statsSelf,
      trigger.statsRequired,
      trigger.statsRequiredTarget,
      trigger.statsEnemy,
      trigger.statsTarget,
      trigger.statsItem,
      trigger.attack,
      ...map(trigger.modifiers, (modifier) => ({
        [modifier.targetStat]: 1,
      })),
      ...flatMap(trigger.modifiers, (modifier) =>
        map(modifier.valueAddingStats, (stat) => ({ [stat]: 1 })),
      ),
    ]),
  ]
  return uniq(allStats.flatMap((stats) => keys(stats))) as Stat[]
}

export const DocsItemDetailClient = ({ itemName }: { itemName: string }) => {
  const meta = useMeta()
  const catalog = useCatalog(meta.data?.viewer?.themeId)

  if (meta.isLoading || catalog.isLoading) {
    return <QueryLoading label="Loading item…" />
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

  const item = catalog.data.items.find(
    (candidate) => candidate.name === itemName,
  )
  if (!item) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-xl font-bold">Item not found</h1>
        <Link
          className="min-h-11 rounded-md border px-4 py-3"
          href="/docs/items"
        >
          Back to items
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        className="flex min-h-11 touch-manipulation items-center self-start text-sm text-muted-foreground underline"
        href="/docs/items"
      >
        Back to all items
      </Link>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <ItemCardClient
          itemData={{ name: ItemName.parse(item.name) }}
          catalog={catalog.data}
          size="320"
          showPrice
        />
        <div className="flex w-full flex-1 flex-col gap-4">
          <section className="rounded-lg bg-border p-4">
            <h1 className="mb-4 text-xl font-bold">{capitalCase(item.name)}</h1>
            <StatDescriptions stats={getItemStats(item)} />
          </section>
          {meta.data?.viewer?.isAdmin && (
            <section className="flex flex-col gap-4 rounded-lg bg-border p-4">
              <GenerateAllImagesButton
                itemId={item.name}
                themeId={catalog.data.imageThemeId}
              />
              <AiImageGalleryItem
                itemId={item.name}
                themeId={catalog.data.imageThemeId}
                className="rounded-md"
              />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
