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

export const defaultTheme: Theme = 'default'

const allThemes = constArrayMap(allThemeDefinitions, 'name')

export const Theme = z.enum(allThemes)
export type Theme = z.infer<typeof Theme>

export const getAllThemes = async () => {
  return allThemeDefinitions
}

export const getThemeDefinition = async (theme: Theme = defaultTheme) => {
  const def = allThemeDefinitions.find((b) => b.name === theme)
  if (!def) {
    throw new Error(`Unknown theme: ${theme}`)
  }
  return def
}
