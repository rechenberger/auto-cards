'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'
import { ReactNode, useState } from 'react'

export const ConfirmActionButton = ({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmVariant = 'default',
  className,
  ...buttonProps
}: Omit<ButtonProps, 'onClick'> & {
  children: ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<unknown>
  confirmVariant?: ButtonProps['variant']
}) => {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) setOpen(nextOpen)
        if (nextOpen) setError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          className={cn('min-h-11 touch-manipulation', className)}
          {...buttonProps}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={pending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={confirmVariant}
            className="min-h-11"
            disabled={pending}
            onClick={() => void confirm()}
          >
            {pending && (
              <LoaderCircle
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
