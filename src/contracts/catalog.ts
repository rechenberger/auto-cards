import { ItemDefinition } from '@/game/ItemDefinition'
import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const ThemeDefinitionDto = z.object({
  name: ThemeId,
  prompt: z.string(),
  hidden: z.boolean().optional(),
  classTop: z.string().optional(),
  classBottom: z.string().optional(),
})
export type ThemeDefinitionDto = z.infer<typeof ThemeDefinitionDto>

export const CatalogImageDto = z.object({
  itemId: z.string(),
  themeId: z.string().nullable(),
  url: z.string().url(),
})
export type CatalogImageDto = z.infer<typeof CatalogImageDto>

export const CatalogResponse = z.object({
  apiVersion: z.literal('v1'),
  rulesetVersion: z.number().int().nonnegative(),
  imageThemeId: ThemeId,
  items: z.array(ItemDefinition),
  themes: z.array(ThemeDefinitionDto),
  images: z.array(CatalogImageDto),
})
export type CatalogResponse = z.infer<typeof CatalogResponse>
