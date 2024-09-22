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
  tiny,
}: {
  items: { name: string }[]
  className?: string
  themeId?: ThemeId
  tiny?: boolean
}) => {
  const betterItems = countifyItems(await orderItems(items))

  if (tiny) {
    return (
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
  }

  return (
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
}
