'use client'

import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useShowDialog } from '../dialog/DialogProvider'
import { consumeSuperActionResponse } from './consumeSuperActionResponse'
import { SuperAction } from './createSuperAction'

export type UseSuperActionOptions = {
  action: SuperAction
  disabled?: boolean
  catchToast?: boolean
  askForConfirmation?: boolean
  stopPropagation?: boolean
}

export const useSuperAction = (options: UseSuperActionOptions) => {
  const [isLoading, setIsLoading] = useState(false)

  const { action, disabled, catchToast, askForConfirmation, stopPropagation } =
    options

  const router = useRouter()
  const showDialog = useShowDialog()

  const trigger = useCallback(
    async (evt?: MouseEvent) => {
      if (isLoading) return
      if (disabled) return
      if (stopPropagation) {
        evt?.stopPropagation()
        evt?.preventDefault()
      }
      if (askForConfirmation) {
        if (!confirm('Are you sure?')) return
      }
      setIsLoading(true)

      const response = await action()

      if (response && 'superAction' in response) {
        await consumeSuperActionResponse({
          response: Promise.resolve(response.superAction),
          onToast: (t) => {
            toast({
              title: t.title,
              description: t.description,
            })
          },
          onDialog: (d) => {
            showDialog(d)
          },
          onRedirect: (r) => {
            if (r.type === 'push') {
              router.push(r.url)
            } else {
              router.replace(r.url)
            }
          },
          catch: catchToast
            ? (e) => {
                toast({
                  variant: 'destructive',
                  title: e.message,
                })
              }
            : undefined,
        })
      }

      setIsLoading(false)
    },
    [
      isLoading,
      disabled,
      stopPropagation,
      askForConfirmation,
      action,
      catchToast,
      showDialog,
      router,
    ],
  )

  return {
    trigger,
    isLoading,
  }
}
