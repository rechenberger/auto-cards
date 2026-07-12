import { z } from 'zod'

export const ApiErrorCode = z.enum([
  'BAD_REQUEST',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'STALE_REVISION',
  'INVALID_COMMAND',
  'INTERNAL_ERROR',
])
export type ApiErrorCode = z.infer<typeof ApiErrorCode>

export const ApiErrorDto = z.object({
  error: z.object({
    code: ApiErrorCode,
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
})
export type ApiErrorDto = z.infer<typeof ApiErrorDto>

export const ApiSuccess = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ data })
