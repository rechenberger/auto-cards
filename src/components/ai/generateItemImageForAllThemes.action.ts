'use server'

import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { getAllThemes } from '@/game/themes'
import { revalidatePath } from 'next/cache'
import { getItemAiImagePrompt } from '../game/getItemAiImagePrompt'
import { generateAiImage } from './generateAiImage.action'
import { getAiImage } from './getAiImage'

export const generateItemImageForAllThemes = async ({
  itemName,
  forceAll,
  forcePrompt,
}: {
  itemName: string
  forceAll?: boolean
  forcePrompt?: boolean
}) => {
  await throwIfNotAdmin({ allowDev: true })
  const themes = await getAllThemes()
  await Promise.all(
    themes.map(async (theme) => {
      const themeId = theme.name
      const itemId = itemName
      const prompt = await getItemAiImagePrompt({
        name: itemId,
        themeId,
      })

      const aiImage = await getAiImage({
        itemId,
        themeId,
        prompt,
      })

      const hasAiImage = !!aiImage
      const hasSamePrompt = aiImage?.prompt === prompt

      let generate = false
      if (forceAll) {
        generate = true
      } else {
        if (forcePrompt) {
          generate = !hasSamePrompt
        } else {
          generate = !hasAiImage
        }
      }

      if (!generate) return

      await generateAiImage({
        prompt,
        itemId,
        themeId,
        force: hasAiImage || forceAll,
      })
    }),
  )
  revalidatePath('/', 'layout')
}
