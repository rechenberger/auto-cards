'use server'

import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { getAllItems } from '@/game/allItems'
import { ThemeId } from '@/game/themes'
import { revalidatePath } from 'next/cache'
import { getItemAiImagePrompt } from '../game/getItemAiImagePrompt'
import { generateAiImage } from './generateAiImage.action'
import { getAiImage } from './getAiImage'

export const generateAllItemImages = async ({
  themeId,
  forceAll,
  forcePrompt,
}: {
  themeId: ThemeId
  forceAll?: boolean
  forcePrompt?: boolean
}) => {
  await throwIfNotAdmin({ allowDev: true })
  const items = await getAllItems()
  await Promise.all(
    items.map(async (item) => {
      const prompt = await getItemAiImagePrompt({
        name: item.name,
        themeId,
      })

      const aiImage = await getAiImage({
        itemId: item.name,
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
        itemId: item.name,
        themeId,
        force: hasAiImage || forceAll,
      })
    }),
  )
  revalidatePath('/', 'layout')
}
