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
  customAskForConfirmationMessage?: {
    title?: string
    description?: string
    buttonLabel?: string
  }
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
        const res = await showDialog(
          {
            title:
              options.customAskForConfirmationMessage?.title ?? 'Are you sure?',
            content: options.customAskForConfirmationMessage?.description ?? '',
          },
          {
            confirmLabel: options.customAskForConfirmationMessage?.buttonLabel,
          },
        )

        showDialog(null)
        if (!res) return
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
      showDialog,
      options.customAskForConfirmationMessage?.title,
      options.customAskForConfirmationMessage?.description,
      options.customAskForConfirmationMessage?.buttonLabel,
      catchToast,
      router,
    ],
  )

  return {
    trigger,
    isLoading,
  }
}
