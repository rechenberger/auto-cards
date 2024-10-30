import { getIsAdmin } from '@/auth/getIsAdmin'
import { AiImageGalleryItem } from '@/components/ai/AiImageGalleryItem'
import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { getMyUserThemeIdWithFallback } from '@/components/game/getMyUserThemeId'
import { ItemCard } from '@/components/game/ItemCard'
import { StatDescriptionsItem } from '@/components/game/StatDescriptionsItem'
import { getItemByName, ItemName } from '@/game/allItems'
import { getAllThemes } from '@/game/themes'
import { capitalCase } from 'change-case'
import { map } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

type PageProps = {
  params: Promise<{
    itemName: ItemName
  }>
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { itemName } = await params
  return {
    title: capitalCase(itemName),
  }
}

export default async function Page({ params }: PageProps) {
  const { itemName } = await params
  const isAdmin = await getIsAdmin({ allowDev: true })
  try {
    await getItemByName(itemName)
  } catch (error) {
    notFound()
  }
  const themeId = await getMyUserThemeIdWithFallback()
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4">
        <ItemCard itemData={{ name: itemName }} size="480" showPrice />
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 bg-border rounded-lg">
            <StatDescriptionsItem itemData={{ name: itemName }} />
          </div>
          {isAdmin && (
            <div className="flex-1 p-4 bg-border rounded-lg">
              <AiImageGalleryItem
                itemId={itemName}
                className="border-black border-2 rounded-lg"
                themeId={themeId}
              />
            </div>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="flex flex-col gap-4 bg-border p-4 rounded-lg">
          <GenerateAllImagesButton itemId={itemName} />
          <div className="flex flex-row flex-wrap gap-2 justify-center">
            {map(await getAllThemes(), (theme) => {
              return (
                <Fragment key={theme.name}>
                  <div className="relative">
                    <ItemCard
                      itemData={{ name: itemName }}
                      themeId={theme.name}
                      size="320"
                      showPrice
                    />
                    <AiImageGalleryItem
                      itemId={itemName}
                      themeId={theme.name}
                      className="rounded-md"
                      tiny
                    />
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
