'use client'

import {
  MatchReplayCardFrame,
  MatchReplayCardProps,
} from '@/components/game/MatchReplayCard'
import { StatsDisplay } from '@/components/game/StatsDisplay'
import { ConfirmButton } from '@/components/ui/confirm-button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CatalogResponse } from '@/contracts/catalog'
import { ItemData } from '@/game/ItemData'
import { capitalCase } from 'change-case'

export const ItemCardClient = ({
  itemData,
  catalog,
  size = '160',
  shopState,
  onSell,
  showPrice,
}: {
  itemData: ItemData
  catalog: CatalogResponse
  size?: MatchReplayCardProps['size']
  shopState?: { isSold?: boolean; isReserved?: boolean }
  onSell?: () => Promise<unknown>
  showPrice?: boolean
}) => {
  const item = catalog.items.find(
    (candidate) => candidate.name === itemData.name,
  )
  const theme = catalog.themes.find(
    (candidate) => candidate.name === catalog.imageThemeId,
  )
  const imageUrl = catalog.images.find(
    (candidate) => candidate.itemId === itemData.name,
  )?.url
  if (!item || !theme) return null

  const cardProps = { itemData, item, theme, imageUrl, size }
  const sellPrice = item.sellPrice ?? Math.ceil(item.price / 2)

  return (
    <div className="relative flex flex-col items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative flex touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Show details for ${capitalCase(itemData.name)}`}
          >
            <MatchReplayCardFrame {...cardProps} onlyTop />
            {shopState?.isSold && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="-rotate-12 border-4 border-red-500 bg-black/80 px-3 py-1 font-black text-red-500">
                  SOLD
                </div>
              </div>
            )}
            {shopState?.isReserved && !shopState.isSold && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="-rotate-12 border-4 border-green-500 bg-black/80 px-3 py-1 font-black text-green-500">
                  RESERVED
                </div>
              </div>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="flex flex-col items-center border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">
            {capitalCase(itemData.name)} details
          </DialogTitle>
          <MatchReplayCardFrame {...cardProps} size="320" onlyTop={false} />
        </DialogContent>
      </Dialog>

      {showPrice && (
        <StatsDisplay stats={{ gold: item.price }} showZero disableTooltip />
      )}

      {onSell && sellPrice > 0 && (
        <ConfirmButton
          variant="outline"
          className="min-h-11 touch-manipulation"
          title={`Sell ${capitalCase(item.name)}?`}
          description="This removes one copy from your loadout."
          confirmLabel={`Sell for ${sellPrice} gold`}
          cancelLabel="Keep item"
          onConfirm={onSell}
        >
          Sell
          <StatsDisplay
            className="ml-2"
            stats={{ gold: sellPrice }}
            showZero
            disableTooltip
          />
        </ConfirmButton>
      )}
    </div>
  )
}
