'use client'

import { toast } from '@/components/ui/use-toast'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Button, type ButtonProps } from './button'

export type AsyncButtonProps = Omit<ButtonProps, 'onClick'> & {
  onAction: () => Promise<unknown> | unknown
  pendingLabel?: string
}

export const AsyncButton = ({
  children,
  disabled,
  onAction,
  pendingLabel,
  ...props
}: AsyncButtonProps) => {
  const [isPending, setIsPending] = useState(false)

  return (
    <Button
      type="button"
      disabled={disabled || isPending}
      aria-busy={isPending}
      onClick={async () => {
        setIsPending(true)
        try {
          await onAction()
        } catch (error) {
          toast({
            title: 'Action failed',
            description:
              error instanceof Error ? error.message : 'Please try again.',
            variant: 'destructive',
          })
        } finally {
          setIsPending(false)
        }
      }}
      {...props}
    >
      {isPending && (
        <LoaderCircle
          className="mr-2 size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {isPending && pendingLabel ? pendingLabel : children}
    </Button>
  )
}
