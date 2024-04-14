'use client'

import { toast } from '@/components/ui/use-toast'
import { useCallback, useState } from 'react'
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

  const trigger = useCallback(
    async (evt: MouseEvent) => {
      if (isLoading) return
      if (disabled) return
      if (stopPropagation) {
        evt.stopPropagation()
        evt.preventDefault()
      }
      if (askForConfirmation) {
        if (!confirm('Are you sure?')) return
      }
      setIsLoading(true)

      await consumeSuperActionResponse({
        response: action(),
        onToast: (t) => {
          toast({
            title: t.title,
            description: t.description,
          })
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

      setIsLoading(false)
    },
    [
      action,
      askForConfirmation,
      disabled,
      isLoading,
      stopPropagation,
      catchToast,
    ],
  )

  return {
    trigger,
    isLoading,
  }
}
