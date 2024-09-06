import { fallbackThemeId } from '@/game/themes'
import { getItemAiImagePrompt } from '../game/getItemAiImagePrompt'
import { AiImageGallery, AiImageGalleryProps } from './AiImageGallery'

export const AiImageGalleryItem = async (
  props: Omit<AiImageGalleryProps, 'prompt'> & { itemId: string },
) => {
  const themeId = await fallbackThemeId(props.themeId)
  const prompt = await getItemAiImagePrompt({
    name: props.itemId,
    themeId,
  })
  return <AiImageGallery {...props} prompt={prompt} themeId={themeId} />
}
