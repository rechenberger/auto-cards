import { z } from 'zod'

export const ApiTokenScope = z.enum([
  'game:read',
  'game:write',
  'live:read',
  'live:write',
  'admin',
])
export type ApiTokenScope = z.infer<typeof ApiTokenScope>

export const ApiTokenScopes = z
  .array(ApiTokenScope)
  .min(1, 'Select at least one scope')
  .refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must be unique',
  })

export const ApiTokenDto = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  scopes: ApiTokenScopes,
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  lastUsedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
})
export type ApiTokenDto = z.infer<typeof ApiTokenDto>

export const ApiTokenListDto = z.object({
  tokens: z.array(ApiTokenDto),
  availableScopes: z.array(ApiTokenScope),
})
export type ApiTokenListDto = z.infer<typeof ApiTokenListDto>

export const CreateApiTokenRequest = z.object({
  name: z.string().trim().min(1).max(64),
  scopes: ApiTokenScopes,
  expiresAt: z.string().datetime().nullable().optional(),
})
export type CreateApiTokenRequest = z.infer<typeof CreateApiTokenRequest>

export const CreatedApiTokenDto = z.object({
  token: ApiTokenDto,
  /** The secret is returned exactly once and is never persisted. */
  secret: z.string().min(1),
})
export type CreatedApiTokenDto = z.infer<typeof CreatedApiTokenDto>

export const RevokeApiTokenDto = z.object({ revoked: z.literal(true) })
export type RevokeApiTokenDto = z.infer<typeof RevokeApiTokenDto>
