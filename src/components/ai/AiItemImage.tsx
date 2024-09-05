import { ThemeId } from '@/game/themes'
import { getItemAiImagePrompt } from '../game/getItemAiImagePrompt'
import { AiImage } from './AiImage'

export const AiItemImage = async ({
  className,
  itemName,
  themeId,
}: {
  className: string
  itemName: string
  themeId: ThemeId
}) => {
  const prompt = await getItemAiImagePrompt({
    name: itemName,
    themeId,
  })
  return (
    <AiImage
      prompt={prompt}
      className={className}
      itemId={itemName}
      themeId={themeId}
    />
  )
}
