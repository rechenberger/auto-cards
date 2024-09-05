import { getMyUser } from '@/auth/getMyUser'
import { getThemeDefinition } from '@/game/themes'

const getMyUserThemeId = async () => {
  const user = await getMyUser()
  const themeId = user?.themeId ?? undefined
  return themeId
}

export const getMyUserThemeIdWithFallback = async () => {
  const themeId = await getMyUserThemeId()
  const theme = await getThemeDefinition(themeId)
  return theme.name
}
