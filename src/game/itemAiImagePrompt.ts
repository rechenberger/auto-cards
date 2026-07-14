import { capitalCase } from 'change-case'
import { getItemByName, ItemName } from './allItems'
import { getThemeDefinition, PLACEHOLDER_ITEM_PROMPT, ThemeId } from './themes'

export const getItemAiImagePrompt = ({
  name,
  themeId,
}: {
  name: string
  themeId: ThemeId
}) => {
  const theme = getThemeDefinition(themeId)
  const item = getItemByName(name as ItemName)
  const itemPrompt = item.prompt || capitalCase(name)
  return theme.prompt.replace(PLACEHOLDER_ITEM_PROMPT, itemPrompt)
}
