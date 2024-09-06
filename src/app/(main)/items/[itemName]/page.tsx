import { getIsAdmin } from '@/auth/getIsAdmin'
import { AiImageGallery } from '@/components/ai/AiImageGallery'
import { AiItemImage } from '@/components/ai/AiItemImage'
import { generateAiImage } from '@/components/ai/generateAiImage.action'
import { GenerateAllImagesButton } from '@/components/ai/GenerateAllImagesButton'
import { getItemAiImagePrompt } from '@/components/game/getItemAiImagePrompt'
import { getMyUserThemeIdWithFallback } from '@/components/game/getMyUserThemeId'
import { ItemCard } from '@/components/game/ItemCard'
import { StatDescriptionsItem } from '@/components/game/StatDescriptionsItem'
import { getItemByName } from '@/game/allItems'
import { getAllThemes } from '@/game/themes'
import { ActionButton } from '@/super-action/button/ActionButton'
import { capitalCase } from 'change-case'
import { map } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type PageProps = {
  params: {
    itemName: string
  }
}

export const generateMetadata = async ({
  params: { itemName },
}: PageProps): Promise<Metadata> => ({
  title: capitalCase(itemName),
})

export default async function Page({ params: { itemName } }: PageProps) {
  const isAdmin = await getIsAdmin({ allowDev: true })
  try {
    await getItemByName(itemName)
  } catch (error) {
    notFound()
  }
  const themeId = await getMyUserThemeIdWithFallback()
  const prompt = await getItemAiImagePrompt({
    name: itemName,
    themeId,
  })
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4">
        <ItemCard name={itemName} size="480" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 bg-border rounded-lg">
            <StatDescriptionsItem name={itemName} />
          </div>
          {isAdmin && (
            <div className="flex-1 p-4 bg-border rounded-lg">
              <AiImageGallery
                itemId={itemName}
                className="border-black border-2 rounded-lg"
                prompt={prompt}
                themeId={themeId}
              />
            </div>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="flex flex-col gap-4 bg-border p-4 rounded-lg">
          <GenerateAllImagesButton itemId={itemName} />
          <div className="grid grid-cols-4 gap-4 ">
            {map(await getAllThemes(), (theme) => (
              <div key={theme.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{theme.name}</h2>
                  <ActionButton
                    className="rounded-sm"
                    catchToast
                    hideIcon
                    action={async () => {
                      'use server'
                      const prompt = await getItemAiImagePrompt({
                        name: itemName,
                        themeId: theme.name,
                      })
                      return generateAiImage({
                        prompt: prompt,
                        itemId: itemName,
                        themeId: theme.name,
                        force: true,
                      })
                    }}
                  >
                    New Image
                  </ActionButton>
                </div>
                <div>
                  <AiItemImage
                    className="aspect-square"
                    itemName={itemName}
                    themeId={theme.name}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
