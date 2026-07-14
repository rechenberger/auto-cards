import { ApiTokenDto } from '@/contracts/api-token'

export const toApiTokenDto = (token: {
  id: string
  name: string
  prefix: string
  scopes: unknown
  createdAt: string
  expiresAt: string | null
  lastUsedAt: string | null
  revokedAt: string | null
}) => ApiTokenDto.parse(token)
