import { getAllItems } from '@/game/allItems'
import { Fragment } from 'react'
import { ItemCard } from '../game/[gameId]/ItemCard'

export default async function Page() {
  const items = await getAllItems()

  return (
    <>
      <div className="flex flex-row flex-wrap gap-2 justify-center">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <ItemCard name={item.name} size="240" />
          </Fragment>
        ))}
      </div>
    </>
  )
}
