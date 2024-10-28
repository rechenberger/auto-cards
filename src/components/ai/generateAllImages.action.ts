'use server'

import { throwIfNotAdmin } from '@/auth/getIsAdmin'
import { ItemName, getAllItems, getItemByName } from '@/game/allItems'
import { ThemeId, getAllThemes, getThemeDefinition } from '@/game/themes'
import { revalidatePath } from 'next/cache'
import { getItemAiImagePrompt } from '../game/getItemAiImagePrompt'
import { generateAiImage } from './generateAiImage.action'
import { getAiImage } from './getAiImage'

export const generateAllImages = async ({
  itemId,
  themeId,
  forceAll,
  forcePrompt,
}: {
  itemId?: string
  themeId?: ThemeId
  forceAll?: boolean
  forcePrompt?: boolean
}) => {
  await throwIfNotAdmin({ allowDev: true })
  const items = itemId
    ? [await getItemByName(itemId as ItemName)]
    : await getAllItems()
  const themes = themeId
    ? [await getThemeDefinition(themeId)]
    : await getAllThemes()

  const combos = items.flatMap((item) =>
    themes.map((theme) => ({
      item,
      theme,
    })),
  )

  await Promise.all(
    combos.map(async ({ item, theme }) => {
      const prompt = await getItemAiImagePrompt({
        name: item.name,
        themeId: theme.name,
      })

      const aiImage = await getAiImage({
        itemId: item.name,
        themeId: theme.name,
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
        themeId: theme.name,
        force: hasAiImage || forceAll,
      })
    }),
  )
  revalidatePath('/', 'layout')
}
