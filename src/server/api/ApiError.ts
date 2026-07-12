import { ApiErrorCode } from '@/contracts/api'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details?: unknown

  constructor({
    code,
    message,
    status,
    details,
  }: {
    code: ApiErrorCode
    message: string
    status: number
    details?: unknown
  }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new ApiError({ code: 'BAD_REQUEST', message, status: 400, details })

export const unauthenticated = (message = 'Authentication required') =>
  new ApiError({ code: 'UNAUTHENTICATED', message, status: 401 })

export const forbidden = (message = 'Forbidden') =>
  new ApiError({ code: 'FORBIDDEN', message, status: 403 })

export const notFound = (message = 'Not found') =>
  new ApiError({ code: 'NOT_FOUND', message, status: 404 })

export const conflict = (message: string, details?: unknown) =>
  new ApiError({ code: 'CONFLICT', message, status: 409, details })

export const staleRevision = (currentRevision: number) =>
  new ApiError({
    code: 'STALE_REVISION',
    message: 'Game state has changed. Refresh and try again.',
    status: 409,
    details: { currentRevision },
  })

export const invalidCommand = (message: string, details?: unknown) =>
  new ApiError({ code: 'INVALID_COMMAND', message, status: 422, details })
