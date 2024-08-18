import { getIsAdmin } from '@/auth/getIsAdmin'
import { AiImageGallery } from '@/components/ai/AiImageGallery'
import { getItemAiImagePrompt } from '@/components/game/getItemAiImagePrompt'
import { ItemCard } from '@/components/game/ItemCard'
import { capitalCase } from 'change-case'
import { Metadata } from 'next'

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
  return (
    <>
      <div className="flex flex-row gap-4">
        <ItemCard name={itemName} size="480" />
        {isAdmin && (
          <div className="flex-1">
            <AiImageGallery
              prompt={getItemAiImagePrompt({ name: itemName })}
              itemId={itemName}
              className="border-black border-2 rounded-lg"
            />
          </div>
        )}
      </div>
    </>
  )
}
