import { AdminJobBatchDto } from '@/contracts/admin'
import { ItemName } from '@/game/allItems'
import { ThemeId } from '@/game/themeSchema'
import { z } from 'zod'

export const AiImageDto = z.object({
  id: z.string(),
  prompt: z.string(),
  url: z.string().url(),
  itemId: z.string().nullable(),
  themeId: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type AiImageDto = z.infer<typeof AiImageDto>

export const AiImagesDto = z.object({
  images: z.array(AiImageDto),
})
export type AiImagesDto = z.infer<typeof AiImagesDto>

export const GenerateAiImagesCommand = z.object({
  type: z.literal('generate'),
  prompt: z.string().trim().min(1).max(20_000),
  itemId: z.string().trim().min(1).max(200).optional(),
  themeId: z.string().trim().min(1).max(200).optional(),
  count: z.number().int().min(1).max(10).default(1),
  force: z.boolean().default(true),
})

export const GenerateAiImageBatchCommand = z.object({
  type: z.literal('generate-batch'),
  itemId: ItemName.optional(),
  themeId: ThemeId.optional(),
  mode: z.enum(['missing', 'prompt', 'all']),
})

export const AiImageCommand = z.discriminatedUnion('type', [
  GenerateAiImagesCommand,
  GenerateAiImageBatchCommand,
])
export type AiImageCommand = z.infer<typeof AiImageCommand>

export const AiImageJobBatchDto = AdminJobBatchDto
export type AiImageJobBatchDto = z.infer<typeof AiImageJobBatchDto>

export const ActivateAiImageResultDto = z.object({
  image: AiImageDto,
})
export type ActivateAiImageResultDto = z.infer<typeof ActivateAiImageResultDto>
