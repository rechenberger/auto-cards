import { game } from '@/db/schema'
import { getAllItems } from '@/game/allItems'
import { Fragment } from 'react'
import { ItemCard } from '../game/[gameId]/ItemCard'

export default async function Page() {
  const items = await getAllItems()

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <ItemCard name={item.name} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
