import { constArrayMap } from '@/lib/constArrayMap'
import {
  fontCreepy,
  fontFuturistic,
  fontMagical,
  fontPixel,
  fontRoyal,
  fontViking,
} from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { z } from 'zod'

export const PLACEHOLDER_ITEM_PROMPT = '[ITEM_PROMPT]' as const
const IMAGE_MODEL_PROMPT = 'Use Flux Schnell and make the image square.'

export type ThemeDefinitionRaw = {
  name: string
  prompt: string
  hidden?: boolean
  classTop?: string
  classBottom?: string
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
    classTop: fontCreepy.className,
    classBottom: fontCreepy.className,
  },
  {
    name: 'royal',
    prompt: `Cartoony Image of ${PLACEHOLDER_ITEM_PROMPT}. Background is a royal throne room. the image should be shiny and royal with jewelry and gold. ${IMAGE_MODEL_PROMPT}`,
    classTop: fontRoyal.className,
    classBottom: fontRoyal.className,
  },
  {
    name: 'magical',
    prompt: `Stunning Image of ${PLACEHOLDER_ITEM_PROMPT} as a wizard item with magical effects. Background is a magical forest with a river and a wizards tower in the background. Everything very magical and mystical. ${IMAGE_MODEL_PROMPT}`,
    classTop: fontMagical.className,
    classBottom: fontMagical.className,
  },
  {
    name: 'pixels',
    prompt: `Image of a pixelated ${PLACEHOLDER_ITEM_PROMPT} represented by a pixelated object like a video game. ${IMAGE_MODEL_PROMPT}`,
    classTop: cn(fontPixel.className, 'text-sm'),
    classBottom: cn(fontPixel.className, 'text-[10px]'),
  },
  {
    name: 'viking',
    prompt: `Image of a viking ${PLACEHOLDER_ITEM_PROMPT}. Background is a viking village with a river and a viking ship in the background. Everything very viking. ${IMAGE_MODEL_PROMPT}`,
    classTop: fontViking.className,
    classBottom: fontViking.className,
  },
  {
    name: 'ecotopia',
    prompt: `Image of a futuristic ${PLACEHOLDER_ITEM_PROMPT}. Background is a city with green plants and trees growing everywhere. Technology and nature combined. Hydroponics, glass domes, water features. Everything very futuristic and green. ${IMAGE_MODEL_PROMPT}`,
    classTop: fontFuturistic.className,
    classBottom: fontFuturistic.className,
  },
  // future themes
  // - cyberpunk
  // - steampunk
  // - pirate
  // - samurai
  // - ninja
  // - alien
  // - robot
  // - monster
  // - fairy
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

export const fallbackThemeId = async (
  themeId: ThemeId | undefined | null,
): Promise<ThemeId> => {
  const theme = await getThemeDefinition(themeId ?? undefined)
  return theme.name
}
