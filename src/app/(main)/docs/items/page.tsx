import { getIsAdmin } from '@/auth/getIsAdmin'
import { AiImageGalleryItem } from '@/components/ai/AiImageGalleryItem'
import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { getMyUserThemeIdWithFallback } from '@/components/game/getMyUserThemeId'
import { ItemCard } from '@/components/game/ItemCard'
import { TagDisplay } from '@/components/game/TagDisplay'
import { ThemeSwitchButton } from '@/components/game/ThemeSwitchButton'
import { SimpleParamSelect } from '@/components/simple/SimpleParamSelect'
import { getAllItems } from '@/game/allItems'
import { orderItems } from '@/game/orderItems'
import { allRarities } from '@/game/rarities'
import { allTags, Tag } from '@/game/tags'
import { capitalCase } from 'change-case'
import { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

export const metadata: Metadata = {
  title: 'Items',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tag?: string
    rarity?: string
  }>
}) {
  let items = await getAllItems()
  items = await orderItems(items)
  const isAdmin = await getIsAdmin({ allowDev: true })

  const { tag, rarity } = await searchParams
  if (tag) {
    items = items.filter((item) => item.tags?.includes(tag as Tag))
  }
  if (rarity) {
    items = items.filter((item) => item.rarity === rarity)
  }

  const themeId = await getMyUserThemeIdWithFallback()

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col flex-1">
          <h2 className="font-bold text-xl">{items.length} Items</h2>
        </div>
        <GenerateAllImagesButton themeId={themeId} />
        <SimpleParamSelect
          options={allTags.map((tag) => ({
            value: tag,
            label: <TagDisplay tag={tag} disableLinks />,
          }))}
          paramKey="tag"
          label="Tag"
          nullLabel="All Tags"
          component="dropdown"
        />
        <SimpleParamSelect
          options={allRarities.map((rarity) => ({
            value: rarity,
            label: capitalCase(rarity),
          }))}
          paramKey="rarity"
          label="Rarity"
          nullLabel="All Rarities"
          component="dropdown"
        />
        <ThemeSwitchButton />
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-center">
        {items.map((item, idx) => (
          <Fragment key={idx}>
            <div className="relative">
              <Link href={`/docs/items/${item.name}`}>
                <ItemCard
                  itemData={{ name: item.name }}
                  size="320"
                  showPrice
                  disableLinks
                />
              </Link>
              {isAdmin && (
                <AiImageGalleryItem
                  itemId={item.name}
                  themeId={themeId}
                  className="rounded-md"
                  tiny
                />
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}
