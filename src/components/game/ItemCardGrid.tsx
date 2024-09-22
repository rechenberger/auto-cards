import { countifyItems } from '@/game/countifyItems'
import { orderItems } from '@/game/orderItems'
import { ThemeId } from '@/game/themes'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { ItemCard } from './ItemCard'

export const ItemCardGrid = async ({
  items,
  className,
  themeId,
}: {
  items: { name: string }[]
  className?: string
  themeId?: ThemeId
}) => {
  const betterItems = countifyItems(await orderItems(items))
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
