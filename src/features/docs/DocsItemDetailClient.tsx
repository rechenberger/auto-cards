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
import { flatMap, keys, map, uniq } from 'lodash-es'
import { ThemeId } from '@/game/themeSchema'

const ThemeItemCard = ({
  itemName,
  themeId,
}: {
  itemName: string
  themeId: ThemeId
}) => {
  const catalog = useCatalog(themeId)
  if (!catalog.data) return null
  return (
    <div className="group relative">
      <ItemCardClient
        itemData={{ name: ItemName.parse(itemName) }}
        catalog={catalog.data}
        size="320"
        showPrice
      />
      <AiImageGalleryItem
        itemId={itemName}
        themeId={themeId}
        className="rounded-md"
        tiny
      />
    </div>
  )
}

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
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row">
        <ItemCardClient
          itemData={{ name: ItemName.parse(item.name) }}
          catalog={catalog.data}
          size="480"
          showPrice
        />
        <div className="flex flex-1 flex-col gap-4">
          <section className="rounded-lg bg-border p-4">
            <StatDescriptions stats={getItemStats(item)} />
          </section>
          {meta.data?.viewer?.isAdmin && (
            <section className="flex-1 rounded-lg bg-border p-4">
              <AiImageGalleryItem
                itemId={item.name}
                themeId={catalog.data.imageThemeId}
                className="rounded-lg border-2 border-black"
              />
            </section>
          )}
        </div>
      </div>
      {meta.data?.viewer?.isAdmin && (
        <div className="flex flex-col gap-4 rounded-lg bg-border p-4">
          <GenerateAllImagesButton itemId={item.name} />
          <div className="flex flex-row flex-wrap justify-center gap-2">
            {catalog.data.themes.map((theme) => (
              <ThemeItemCard
                key={theme.name}
                itemName={item.name}
                themeId={theme.name}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
