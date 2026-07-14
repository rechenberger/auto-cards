'use client'

import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { SimpleTooltip } from '@/components/simple/SimpleTooltip'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { TagDisplay } from '@/components/game/TagDisplay'
import { Button } from '@/components/ui/button'
import { CatalogResponse } from '@/contracts/catalog'
import { GameDto } from '@/contracts/game-api'
import { ItemCardClient } from '@/features/game/ItemCardClient'
import { checkCollectorLoadout } from '@/game/collector/checkCollectorLoadout'
import { countifyItems } from '@/game/countifyItems'
import { ItemData } from '@/game/ItemData'
import { orderItems } from '@/game/orderItems'
import { allRarities } from '@/game/rarities'
import { allTags, Tag } from '@/game/tags'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { last, orderBy } from 'lodash-es'
import { ArrowUp, Check, Recycle, Star } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  CollectorCommandButton,
  CollectorCommandHandler,
} from './CollectorCommandButton'
import { CollectorLoadoutCheck } from './CollectorLoadoutCheck'
import { CollectorSalvageButtons } from './CollectorSalvageButtons'
import { CollectorUpgradeDialog } from './CollectorUpgradeDialog'

type CollectorTab = 'loadout' | 'inventory' | 'favorites' | 'workshop'
type CollectorOrder = 'rarity' | 'category' | 'newest'

export const CollectorItemGrid = ({
  game,
  catalog,
  onCommand,
  pending,
}: {
  game: GameDto
  catalog: CatalogResponse
  onCommand: CollectorCommandHandler
  pending: boolean
}) => {
  const searchParams = useSearchParams()
  const requestedTab = (searchParams.get('tab') ?? 'loadout') as CollectorTab
  const order = (searchParams.get('order') ?? 'rarity') as CollectorOrder
  const tag = searchParams.get('tag') as Tag | null
  const [upgradeItemId, setUpgradeItemId] = useState<string>()

  const loadoutItems = game.data.currentLoadout.items
  const inventoryItems = game.data.inventory?.items ?? []
  const favoriteItems = inventoryItems.filter((item) => item.favorite)
  const tab =
    requestedTab === 'favorites' && !favoriteItems.length
      ? 'loadout'
      : requestedTab

  let itemsShown =
    tab === 'loadout'
      ? loadoutItems
      : tab === 'favorites'
        ? favoriteItems
        : inventoryItems
  itemsShown = orderBy(itemsShown, (item) => item.name)
  itemsShown = countifyItems(orderItems(itemsShown, game.version))
  if (order === 'rarity') {
    itemsShown = orderBy(itemsShown, (item) =>
      item.rarity ? -allRarities.indexOf(item.rarity) : -Infinity,
    )
  } else if (order === 'newest') {
    itemsShown = orderBy(itemsShown, (item) => item.createdAt, 'desc')
  }

  const loadoutIds = new Set(
    loadoutItems.flatMap((item) => (item.id ? [item.id] : [])),
  )
  const loadoutCheck = checkCollectorLoadout({
    loadout: game.data.currentLoadout,
    rulesetVersion: game.version,
  })
  const upgradeItem = inventoryItems.find((item) => item.id === upgradeItemId)
  const separateWorkshopTab = false
  const showWorkshop = !separateWorkshopTab || tab === 'workshop'

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="top-0 z-10 -my-2 flex flex-col gap-2 bg-background py-2 xl:sticky">
        <div className="flex flex-col gap-2 xl:flex-row">
          <SimpleParamSelect
            paramKey="tab"
            component="tabs"
            options={[
              { value: null, label: `Loadout (${loadoutItems.length})` },
              ...(favoriteItems.length
                ? [
                    {
                      value: 'favorites',
                      label: `Favorites (${favoriteItems.length})`,
                    },
                  ]
                : []),
              {
                value: 'inventory',
                label: `Inventory (${inventoryItems.length})`,
              },
            ]}
          />
          <div className="flex-1" />
          <CollectorLoadoutCheck game={game} />
          <SimpleParamSelect
            options={allTags.map((itemTag) => ({
              value: itemTag,
              label: <TagDisplay tag={itemTag} disableLinks />,
            }))}
            paramKey="tag"
            label="Tag"
            nullLabel="All Tags"
            component="dropdown"
          />
          <SimpleParamSelect
            paramKey="order"
            component="dropdown"
            label="Order By"
            options={[
              { value: null, label: 'By Rarity' },
              { value: 'category', label: 'By Category' },
              { value: 'newest', label: 'Newest' },
            ]}
          />
        </div>
        {showWorkshop && (
          <CollectorSalvageButtons
            game={game}
            inventoryItems={inventoryItems}
            loadoutItems={loadoutItems}
            onCommand={onCommand}
            pending={pending}
          />
        )}
      </div>

      <div className="flex flex-1 flex-row flex-wrap items-start justify-center gap-x-2 gap-y-6">
        {itemsShown.map((item, index) => {
          const itemDefinition = catalog.items.find(
            (candidate) => candidate.name === item.name,
          )
          if (!itemDefinition || (tag && !itemDefinition.tags?.includes(tag))) {
            return null
          }
          const selectable = Boolean(item.id)
          const inLoadout = item.id ? loadoutIds.has(item.id) : true
          const itemId = item.id
          const tooMany =
            inLoadout &&
            loadoutCheck.countTooMany.some(
              (candidate) => candidate.name === item.name,
            )

          return (
            <div
              key={item.id ?? `${item.name}-${index}`}
              className={cn(
                'flex flex-col items-center gap-2 rounded-md',
                tooMany && 'ring ring-red-500',
              )}
            >
              <ItemCardClient
                itemData={item}
                catalog={catalog}
                size={tab === 'inventory' ? '120' : '160'}
              />
              <div
                className={cn(
                  'flex flex-row gap-1',
                  !selectable && 'invisible',
                )}
                aria-hidden={!selectable}
              >
                <CollectorCommandButton
                  variant="secondary"
                  className={cn(
                    'gap-2 rounded-none px-2 py-1 text-xs first:rounded-l-md last:rounded-r-md',
                    !inLoadout && 'grayscale opacity-60',
                  )}
                  compact
                  disabled={!itemId}
                  tabIndex={selectable ? undefined : -1}
                  pending={pending}
                  onCommand={onCommand}
                  command={{
                    type: 'toggle-loadout-item',
                    itemId: itemId ?? 'unselectable',
                  }}
                  accessibleLabel={
                    inLoadout
                      ? `Remove ${capitalCase(item.name)} from loadout`
                      : `Add ${capitalCase(item.name)} to loadout`
                  }
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                      inLoadout && 'bg-primary text-primary-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {inLoadout && <Check className="size-4" />}
                  </span>
                  {!!itemDefinition.price && (
                    <StatsDisplay
                      stats={{ weight: itemDefinition.price }}
                      size="sm"
                      showZero
                      disableTooltip
                    />
                  )}
                </CollectorCommandButton>
                <SimpleTooltip
                  tooltip={
                    item.favorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <CollectorCommandButton
                    variant="secondary"
                    size="icon"
                    className={cn(
                      'rounded-none p-1 first:rounded-l-md last:rounded-r-md',
                      item.favorite
                        ? 'text-yellow-500'
                        : 'grayscale opacity-60',
                    )}
                    compact
                    disabled={!itemId}
                    tabIndex={selectable ? undefined : -1}
                    pending={pending}
                    onCommand={onCommand}
                    command={{
                      type: 'toggle-favorite-item',
                      itemId: itemId ?? 'unselectable',
                    }}
                    accessibleLabel={
                      item.favorite
                        ? `Remove ${capitalCase(item.name)} from favorites`
                        : `Add ${capitalCase(item.name)} to favorites`
                    }
                  >
                    <Star
                      className="size-4"
                      fill={item.favorite ? 'currentColor' : undefined}
                      aria-hidden="true"
                    />
                  </CollectorCommandButton>
                </SimpleTooltip>
              </div>

              {showWorkshop && (
                <div
                  className={cn(
                    'flex flex-row gap-1',
                    !selectable && 'invisible',
                  )}
                  aria-hidden={!selectable}
                >
                  {item.rarity !== last(allRarities) && (
                    <SimpleTooltip tooltip="Upgrade rarity and add a random aspect.">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="!size-7 min-h-0 touch-manipulation rounded-none p-1 first:rounded-l-md last:rounded-r-md [@media(pointer:coarse)]:!size-11 [@media(pointer:coarse)]:min-h-11"
                        disabled={!itemId || pending}
                        tabIndex={selectable ? undefined : -1}
                        aria-label={`Upgrade ${capitalCase(item.name)}`}
                        onClick={() => setUpgradeItemId(itemId)}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Button>
                    </SimpleTooltip>
                  )}
                  <SimpleTooltip tooltip="Salvage this item for one part.">
                    <CollectorCommandButton
                      variant="secondary"
                      size="icon"
                      compact
                      className="rounded-none p-1 first:rounded-l-md last:rounded-r-md"
                      disabled={!itemId}
                      tabIndex={selectable ? undefined : -1}
                      pending={pending}
                      onCommand={onCommand}
                      command={{
                        type: 'salvage-item',
                        itemId: itemId ?? 'unselectable',
                      }}
                      accessibleLabel={`Salvage ${capitalCase(item.name)}`}
                      confirm={{
                        title: `Salvage ${capitalCase(item.name)}?`,
                        description: inLoadout
                          ? 'This item is currently in your loadout.'
                          : item.favorite
                            ? 'This item is currently one of your favorites.'
                            : 'You will receive one salvaged part.',
                        action: 'Salvage item',
                      }}
                    >
                      <Recycle className="size-4" aria-hidden="true" />
                    </CollectorCommandButton>
                  </SimpleTooltip>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CollectorUpgradeDialog
        item={upgradeItem}
        game={game}
        catalog={catalog}
        open={Boolean(upgradeItem)}
        onOpenChange={(open) => {
          if (!open) setUpgradeItemId(undefined)
        }}
        onCommand={onCommand}
        pending={pending}
      />
    </div>
  )
}
