import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

export const PLACEHOLDER_ITEM_PROMPT = '[ITEM_PROMPT]' as const
const IMAGE_MODEL_PROMPT = 'Use Flux Schnell and make the image square.'

export type ThemeDefinitionRaw = {
  name: string
  prompt: string
  hidden?: boolean
}

const allThemeDefinitions = [
  {
    name: 'legacy',
    prompt: `Cartoony cozy Image of ${PLACEHOLDER_ITEM_PROMPT}. Background is a sunny track trough the mountains or woods whatever fits.`,
    hidden: true,
  },
  {
    name: 'cozy',
    prompt: `Cartoony cozy Image of ${PLACEHOLDER_ITEM_PROMPT}. Background is a sunny track trough the mountains, surrounded by vibrant trees and a clear blue sky, warm colors, cheerful atmosphere. ${IMAGE_MODEL_PROMPT}`,
  },
  {
    name: 'halloween',
    prompt: `Crazy scary image of ${PLACEHOLDER_ITEM_PROMPT}. Halloween theme. ${IMAGE_MODEL_PROMPT}`,
  },
  {
    name: 'royal',
    prompt: `Cartoony Image of ${PLACEHOLDER_ITEM_PROMPT}. Background is a royal throne room. the image should be shiny and royal with jewelry and gold. ${IMAGE_MODEL_PROMPT}`,
  },
] as const satisfies ThemeDefinitionRaw[]

export type ThemeDefinition = ThemeDefinitionRaw & {
  name: ThemeId
}

export const nullThemeId: ThemeId = 'legacy' // Saved in DB as null
export const defaultThemeId: ThemeId = 'cozy' // Default theme

const allThemes = constArrayMap(allThemeDefinitions, 'name')

export const ThemeId = z.enum(allThemes)
export type ThemeId = z.infer<typeof ThemeId>

export const getAllThemes = async (): Promise<ThemeDefinition[]> => {
  return allThemeDefinitions
}

export const getThemeDefinition = async (
  theme: ThemeId = defaultThemeId,
): Promise<ThemeDefinition> => {
  let def = allThemeDefinitions.find((b) => b.name === theme)
  if (!def) {
    def = allThemeDefinitions.find((b) => b.name === defaultThemeId)
  }
  if (!def) {
    throw new Error(`Unknown theme: ${theme}`)
  }
  return def
}
