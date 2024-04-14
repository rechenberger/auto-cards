import { createServerContext } from '@sodefa/next-server-context'
import { ReactNode } from 'react'
import { createResolvablePromise } from './createResolvablePromise'

export type SuperActionToast = {
  title?: string
  description?: ReactNode
}

export type SuperActionError = {
  message?: string
}

export type SuperActionResponse<T> = {
  result?: T
  next?: Promise<SuperActionResponse<T>>
  toast?: SuperActionToast
  error?: SuperActionError
}

type SuperActionContext = {
  showToast: (toast: SuperActionToast) => void
  chain: (val: SuperActionResponse<any>) => void
}

const serverContext = createServerContext<SuperActionContext>()

export const superAction = <T>(action: () => Promise<T>) => {
  let next = createResolvablePromise<SuperActionResponse<T>>()
  const firstPromise = next.promise

  const chain = (val: SuperActionResponse<T>) => {
    const oldNext = next
    next = createResolvablePromise<SuperActionResponse<T>>()
    oldNext.resolve({ ...val, next: next.promise })
  }
  const complete = (val: SuperActionResponse<T>) => {
    next.resolve(val)
  }

  const showToast = (toast: SuperActionToast) => {
    chain({ toast })
  }

  const ctx: SuperActionContext = {
    showToast,
    chain,
  }

  serverContext.set(ctx)

  action()
    .then((result) => complete({ result }))
    .catch((error) => {
      // console.error('SOME ERROR', {
      //   message: error?.message,
      // })
      complete({
        error: {
          message: error?.message,
        },
      })
    })

  return firstPromise
}

export type SuperAction<T = any> = () => Promise<SuperActionResponse<T>>

export const showToast = (toast: SuperActionToast) => {
  const ctx = serverContext.getOrThrow()
  ctx.showToast(toast)
}
