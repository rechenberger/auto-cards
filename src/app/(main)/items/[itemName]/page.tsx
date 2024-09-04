import { getIsAdmin } from '@/auth/getIsAdmin'
import { AiImageGallery } from '@/components/ai/AiImageGallery'
import { getItemAiImagePrompt } from '@/components/game/getItemAiImagePrompt'
import { getMyUserThemeId } from '@/components/game/getMyUserThemeId'
import { ItemCard } from '@/components/game/ItemCard'
import { StatDescriptionsItem } from '@/components/game/StatDescriptionsItem'
import { getItemByName } from '@/game/allItems'
import { defaultThemeId } from '@/game/themes'
import { capitalCase } from 'change-case'
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
  const themeId = (await getMyUserThemeId()) ?? defaultThemeId
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
    </>
  )
}
