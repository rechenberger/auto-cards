import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const MetaViewerDto = z.object({
  id: z.string(),
  isAdmin: z.boolean(),
  themeId: ThemeId,
})
export type MetaViewerDto = z.infer<typeof MetaViewerDto>

export const MetaResponse = z.object({
  apiVersion: z.literal('v1'),
  openApiUrl: z.literal('/api/openapi.json'),
  rulesetVersion: z.number().int().nonnegative(),
  numberOfRounds: z.number().int().positive(),
  replay: z.object({
    format: z.literal('seed-loadouts'),
    logsIncluded: z.literal(false),
  }),
  viewer: MetaViewerDto.nullable(),
})
export type MetaResponse = z.infer<typeof MetaResponse>
