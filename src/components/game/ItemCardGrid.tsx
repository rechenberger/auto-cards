import { ITEM_CARD_GRID_FORCE_SIZE } from '@/game/config'
import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { ThemeId } from '@/game/themes'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'
import { TinyItem } from './TinyItem'

export const ItemCardGrid = async ({
  items,
  className,
  themeId,
  size,
}: {
  items: { name: string }[]
  className?: string
  themeId?: ThemeId
  size?: '80' | 'tiny' | 'responsive'
}) => {
  const betterItems = countifyItems(await orderItems(items))

  if (ITEM_CARD_GRID_FORCE_SIZE) {
    size = ITEM_CARD_GRID_FORCE_SIZE
  }

  const tiny = (
    <div
      className={cn(
        'flex flex-row gap-1 flex-wrap items-center justify-center',
        className,
      )}
    >
      {betterItems.map((item, idx) => (
        <Fragment key={idx}>
          <TinyItem name={item.name} count={item.count} />
        </Fragment>
      ))}
    </div>
  )

  if (size === 'tiny') {
    return tiny
  }

  const big = (
    <div
      className={cn(
        'flex-1 flex flex-row flex-wrap gap-1 justify-center items-start',
        className,
      )}
    >
      {betterItems.map((item, idx) => {
        return (
          <Fragment key={idx}>
            <div className="relative">
              <ItemCard
                name={item.name}
                count={item.count}
                size={'80'}
                onlyTop
                themeId={themeId}
              />
            </div>
          </Fragment>
        )
      })}
    </div>
  )

  if (size === 'responsive') {
    return (
      <>
        <div className="hidden xl:flex">{big}</div>
        <div className="flex xl:hidden">{tiny}</div>
      </>
    )
  }

  return big
}
