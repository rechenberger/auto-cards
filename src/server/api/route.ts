import { ApiError, badRequest } from './ApiError'

export type ApiRouteContext = {
  requestId: string
}

export const apiRoute =
  <TArgs extends unknown[]>(
    handler: (context: ApiRouteContext, ...args: TArgs) => Promise<Response>,
  ) =>
  async (...args: TArgs) => {
    const requestId = crypto.randomUUID()
    try {
      const response = await handler({ requestId }, ...args)
      response.headers.set('x-request-id', requestId)
      return response
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json(
          {
            error: {
              code: error.code,
              message: error.message,
              requestId,
              details: error.details,
            },
          },
          {
            status: error.status,
            headers: { 'x-request-id': requestId },
          },
        )
      }

      console.error('Unhandled API error', { requestId, error })
      return Response.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            requestId,
          },
        },
        {
          status: 500,
          headers: { 'x-request-id': requestId },
        },
      )
    }
  }

export const apiData = <T>(data: T, init?: ResponseInit) =>
  Response.json({ data }, init)

export const parseJson = (body: string): unknown => {
  try {
    return JSON.parse(body || 'null')
  } catch {
    throw badRequest('Request body must be valid JSON')
  }
}
