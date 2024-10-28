import { getItemByName, ItemName } from '@/game/allItems'
import {
  getThemeDefinition,
  PLACEHOLDER_ITEM_PROMPT,
  ThemeId,
} from '@/game/themes'
import { capitalCase } from 'change-case'

export const getItemAiImagePrompt = async ({
  name,
  themeId,
}: {
  name: string
  themeId: ThemeId
}) => {
  const theme = await getThemeDefinition(themeId)
  let prompt = theme.prompt

  const itemDef = await getItemByName(name as ItemName)
  const itemPrompt = itemDef.prompt || capitalCase(name)
  prompt = prompt.replace(PLACEHOLDER_ITEM_PROMPT, itemPrompt)
  return prompt
}
