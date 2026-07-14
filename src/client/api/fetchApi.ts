import { ApiErrorDto, ApiSuccess } from '@/contracts/api'
import { z } from 'zod'

export class ClientApiError extends Error {
  readonly status: number
  readonly code:
    | z.infer<typeof ApiErrorDto>['error']['code']
    | 'INVALID_RESPONSE'
  readonly requestId?: string
  readonly details?: unknown

  constructor({
    status,
    code,
    message,
    requestId,
    details,
  }: {
    status: number
    code: ClientApiError['code']
    message: string
    requestId?: string
    details?: unknown
  }) {
    super(message)
    this.name = 'ClientApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

export const fetchApi = async <TSchema extends z.ZodTypeAny>(
  input: RequestInfo | URL,
  schema: TSchema,
  init?: RequestInit,
): Promise<z.infer<TSchema>> => {
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  const response = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers,
  })

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = ApiErrorDto.safeParse(body)
    if (error.success) {
      throw new ClientApiError({
        status: response.status,
        code: error.data.error.code,
        message: error.data.error.message,
        requestId: error.data.error.requestId,
        details: error.data.error.details,
      })
    }
    throw new ClientApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: `Request failed with status ${response.status}`,
    })
  }

  const result = ApiSuccess(schema).safeParse(body)
  if (!result.success) {
    throw new ClientApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid response',
      details: result.error.flatten(),
    })
  }
  return result.data.data
}

export const jsonRequest = (body: unknown, init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  return { ...init, headers, body: JSON.stringify(body) }
}
