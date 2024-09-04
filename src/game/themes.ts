import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

const ITEM_PROMPT = '[ITEM_PROMPT]'

const allThemeDefinitions = [
  {
    name: 'default',
    prompt: `Cartoony cozy Image of ${ITEM_PROMPT}. Background is a sunny track trough the mountains or woods whatever fits.`,
  },
  {
    name: 'halloween',
    prompt: `Crazy scary image of ${ITEM_PROMPT}. Halloween theme. Use Flux Schnell and make the image square.`,
  },
] as const

export const defaultTheme: ThemeId = 'default'

const allThemes = constArrayMap(allThemeDefinitions, 'name')

export const ThemeId = z.enum(allThemes)
export type ThemeId = z.infer<typeof ThemeId>

export const getAllThemes = async () => {
  return allThemeDefinitions
}

export const getThemeDefinition = async (theme: ThemeId = defaultTheme) => {
  const def = allThemeDefinitions.find((b) => b.name === theme)
  if (!def) {
    throw new Error(`Unknown theme: ${theme}`)
  }
  return def
}
