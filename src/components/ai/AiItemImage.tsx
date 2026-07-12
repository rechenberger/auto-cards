'use client'

import { ThemeId } from '@/game/themes'
import { getItemAiImagePrompt } from '@/game/itemAiImagePrompt'
import { AiImage } from './AiImage'

export const AiItemImage = ({
  className,
  itemName,
  themeId,
}: {
  className: string
  itemName: string
  themeId: ThemeId
}) => (
  <AiImage
    prompt={getItemAiImagePrompt({ name: itemName, themeId })}
    className={className}
    itemId={itemName}
    themeId={themeId}
  />
)
