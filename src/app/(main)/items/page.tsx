import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { getMyUserThemeIdWithFallback } from '@/components/game/getMyUserThemeId'
import { ItemCard } from '@/components/game/ItemCard'
import { ThemeSwitchButton } from '@/components/game/ThemeSwitchButton'
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

  const themeId = await getMyUserThemeIdWithFallback()

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col flex-1">
          <h2 className="font-bold text-xl">{items.length} Items</h2>
        </div>
        <GenerateAllImagesButton themeId={themeId} />
        <ThemeSwitchButton />
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-center">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <Link href={`/items/${item.name}`}>
              <ItemCard name={item.name} size="320" />
            </Link>
          </Fragment>
        ))}
      </div>
    </>
  )
}
