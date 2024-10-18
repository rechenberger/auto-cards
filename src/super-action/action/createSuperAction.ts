import { createServerContext } from '@sodefa/next-server-context'
import {
  getRedirectStatusCodeFromError,
  getRedirectTypeFromError,
  getURLFromRedirectError,
  isRedirectError,
} from 'next/dist/client/components/redirect'
import { ReactNode } from 'react'
import { z } from 'zod'
import { createResolvablePromise } from './createResolvablePromise'

export type SuperActionToast = {
  title?: string
  description?: ReactNode
}

export type SuperActionDialog = {
  title?: string
  content?: ReactNode
  confirm?: string
  cancel?: string
} | null

export type SuperActionError = {
  message?: string
}

export type SuperActionRedirect = {
  url: string
  type: 'push' | 'replace'
  statusCode: number
}

export type SuperActionResponse<Result, Input> = {
  result?: Result
  next?: Promise<SuperActionResponse<Result, Input>>
  toast?: SuperActionToast
  dialog?: SuperActionDialog
  error?: SuperActionError
  redirect?: SuperActionRedirect
  action?: SuperAction<Result, undefined>
}

type SuperActionContext<Result, Input> = {
  chain: (val: SuperActionResponse<Result, Input>) => void
}

const serverContext = createServerContext<SuperActionContext<any, any>>()

export const superAction = async <Result, Input>(
  action: () => Promise<Result>,
) => {
  let next = createResolvablePromise<SuperActionResponse<Result, Input>>()
  const firstPromise = next.promise

  const chain = (val: SuperActionResponse<Result, Input>) => {
    const oldNext = next
    next = createResolvablePromise<SuperActionResponse<Result, Input>>()
    oldNext.resolve({ ...val, next: next.promise })
  }
  const complete = (val: SuperActionResponse<Result, Input>) => {
    next.resolve(val)
  }

  const ctx: SuperActionContext<Result, Input> = {
    chain,
  }

  serverContext.set(ctx)

  // Execute Action:
  action()
    .then((result) => {
      complete({ result })
    })
    .catch((error: unknown) => {
      if (isRedirectError(error)) {
        if (firstPromise === next.promise) {
          next.reject(error)
        }
        // We already streamed something, so can't throw the Next.js redirect
        // We send the redirect as a response instead for the client to handle
        complete({
          redirect: {
            url: getURLFromRedirectError(error),
            type: getRedirectTypeFromError(error),
            statusCode: getRedirectStatusCodeFromError(error),
          },
        })
        return
      }

      const parsed = z
        .object({
          message: z.string(),
        })
        .safeParse(error)

      complete({
        error: {
          message: parsed.success ? parsed.data?.message : 'Unknown error',
        },
      })
    })

  const superAction = await firstPromise
  return { superAction }
}

export type SuperActionPromise<Result, Input> = Promise<{
  superAction: SuperActionResponse<Result, Input>
} | void>

export type SuperAction<Result, Input> = (
  input: Input,
) => SuperActionPromise<Result, Input>

export type SuperActionWithInput<Input> = SuperAction<unknown, Input>
export type SuperActionWithResult<Result> = SuperAction<Result, unknown>

export const streamToast = (toast: SuperActionToast) => {
  const ctx = serverContext.getOrThrow()
  ctx.chain({ toast })
}

export const streamDialog = (dialog: SuperActionDialog) => {
  const ctx = serverContext.getOrThrow()
  ctx.chain({ dialog })
}

export const streamAction = <Result>(
  action: SuperAction<Result, undefined>,
) => {
  const ctx = serverContext.getOrThrow()
  ctx.chain({ action })
}
