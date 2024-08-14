import { ItemCard } from '@/components/game/ItemCard'
import { getAllItems } from '@/game/allItems'
import { Metadata } from 'next'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Items',
}

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
