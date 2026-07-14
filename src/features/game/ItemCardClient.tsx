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
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CatalogResponse } from '@/contracts/catalog'
import { ItemData } from '@/game/ItemData'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import Link from 'next/link'

export const ItemCardClient = ({
  itemData,
  catalog,
  size = '160',
  shopState,
  onSell,
  showPrice,
  onlyTop = false,
  href,
}: {
  itemData: ItemData
  catalog: CatalogResponse
  size?: MatchReplayCardProps['size']
  shopState?: { isSold?: boolean; isReserved?: boolean }
  onSell?: () => Promise<unknown>
  showPrice?: boolean
  onlyTop?: boolean
  href?: string
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

  const cardProps = { itemData, item, theme, imageUrl, size, showPrice }
  const sellPrice = item.sellPrice ?? Math.ceil(item.price / 2)
  const sellButtonPosition =
    size === '240'
      ? 'top-9'
      : size === '200'
        ? 'top-[30px]'
        : size === '160'
          ? 'top-6'
          : size === '120'
            ? 'top-[18px]'
            : 'top-3'

  if (href) {
    return (
      <div className="relative flex rounded-xl">
        <div aria-hidden="true" inert>
          <MatchReplayCardFrame {...cardProps} onlyTop={onlyTop} />
        </div>
        <Link
          href={href}
          className="absolute inset-0 z-10 touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${capitalCase(itemData.name)}`}
        />
      </div>
    )
  }

  return (
    <div className="group relative flex flex-col items-center">
      <Dialog>
        <div className="relative flex rounded-xl">
          <div aria-hidden="true" inert>
            <MatchReplayCardFrame {...cardProps} onlyTop={onlyTop} />
          </div>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute inset-0 z-10 touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Show details for ${capitalCase(itemData.name)}`}
            />
          </DialogTrigger>
          {shopState?.isSold && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex aspect-square items-center justify-center">
              <div className="-rotate-12 border-4 border-red-500 bg-black/80 px-4 py-1 font-black text-red-500">
                SOLD
              </div>
            </div>
          )}
          {shopState?.isReserved && !shopState.isSold && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex aspect-square items-center justify-center">
              <div className="-rotate-12 border-4 border-green-500 bg-black/80 px-4 py-1 font-black text-green-500">
                RESERVED
              </div>
            </div>
          )}
        </div>
        <DialogContent className="flex flex-col items-center border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">
            {capitalCase(itemData.name)} details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full card details for {capitalCase(itemData.name)}.
          </DialogDescription>
          <MatchReplayCardFrame {...cardProps} size="320" onlyTop={false} />
        </DialogContent>
      </Dialog>

      {onSell && sellPrice > 0 && (
        <div
          className={cn(
            'absolute inset-x-0 z-20 flex justify-center opacity-100',
            sellButtonPosition,
            'motion-safe:transition-opacity motion-safe:duration-150',
            '[@media(hover:hover)_and_(pointer:fine)]:opacity-0',
            '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100',
            '[@media(hover:hover)_and_(pointer:fine)]:focus-within:opacity-100',
          )}
        >
          <ConfirmButton
            size="sm"
            variant="outline"
            confirmVariant="default"
            className="relative touch-manipulation gap-2 after:absolute after:-inset-1 after:content-['']"
            title={`Sell ${capitalCase(item.name)}?`}
            description="This removes one copy from your loadout."
            confirmLabel={
              <span className="flex items-center gap-2">
                Yes
                <StatsDisplay
                  stats={{ gold: sellPrice }}
                  showZero
                  size="sm"
                  disableTooltip
                />
              </span>
            }
            cancelLabel="Keep item"
            onConfirm={onSell}
          >
            Sell
            <StatsDisplay stats={{ gold: sellPrice }} showZero disableTooltip />
          </ConfirmButton>
        </div>
      )}
    </div>
  )
}
