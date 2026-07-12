'use client'

import { fallbackThemeId, ThemeId } from '@/game/themes'
import { getItemAiImagePrompt } from '@/game/itemAiImagePrompt'
import { AiImageGallery, AiImageGalleryProps } from './AiImageGallery'

export const AiImageGalleryItem = (
  props: Omit<AiImageGalleryProps, 'prompt'> & { itemId: string },
) => {
  const themeId = fallbackThemeId(props.themeId as ThemeId)
  const prompt = getItemAiImagePrompt({
    name: props.itemId,
    themeId,
  })
  return <AiImageGallery {...props} prompt={prompt} themeId={themeId} />
}
