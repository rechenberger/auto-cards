import { ItemCard } from '@/components/game/ItemCard'
import { getAllItems } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Items',
}

export default async function Page() {
  let items = await getAllItems()
  items = await orderItems(items)

  return (
    <>
      <div className="flex flex-row flex-wrap gap-2 justify-center">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <Link href={`/items/${item.name}`}>
              <ItemCard name={item.name} size="240" />
            </Link>
          </Fragment>
        ))}
      </div>
    </>
  )
}
