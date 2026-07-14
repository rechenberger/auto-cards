import { CatalogImageDto, ThemeDefinitionDto } from '@/contracts/catalog'
import { LoadoutData } from '@/game/LoadoutData'
import { ItemDefinition } from '@/game/ItemDefinition'
import { GameMode } from '@/game/gameMode'
import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const MatchReplayParticipantDto = z.object({
  sideIdx: z.number().int().nonnegative(),
  status: z.enum(['won', 'lost']),
  displayName: z.string(),
  themeId: ThemeId,
  loadoutId: z.string(),
  loadout: LoadoutData,
})
export type MatchReplayParticipantDto = z.infer<
  typeof MatchReplayParticipantDto
>

export const MatchReplayResponse = z.object({
  apiVersion: z.literal('v1'),
  match: z.object({
    id: z.string(),
    seed: z.string(),
    gameMode: GameMode,
    createdAt: z.string().nullable(),
  }),
  rulesetVersion: z.number().int().nonnegative(),
  currentRulesetVersion: z.number().int().nonnegative(),
  participants: z.array(MatchReplayParticipantDto).length(2),
  assets: z.object({
    itemDefinitions: z.array(ItemDefinition),
    themes: z.array(ThemeDefinitionDto),
    images: z.array(CatalogImageDto),
  }),
})
export type MatchReplayResponse = z.infer<typeof MatchReplayResponse>
