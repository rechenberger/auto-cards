import { z } from 'zod'

export const themeIds = [
  'cozy',
  'halloween',
  'royal',
  'magical',
  'pixels',
  'viking',
  'ecotopia',
  'solarpunk',
] as const

export const ThemeId = z.enum(themeIds)
export type ThemeId = z.infer<typeof ThemeId>

/** Legacy theme rows store this value as null. */
export const nullThemeId: ThemeId = 'legacy' as ThemeId
export const defaultThemeId: ThemeId = 'cozy'
