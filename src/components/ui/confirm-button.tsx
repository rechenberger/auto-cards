'use client'

import { ReactNode, useState } from 'react'
import { AsyncButton } from './async-button'
import { Button, type ButtonProps } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

export type ConfirmButtonProps = ButtonProps & {
  title: ReactNode
  description?: ReactNode
  confirmLabel: ReactNode
  cancelLabel?: ReactNode
  onConfirm: () => Promise<unknown> | unknown
  confirmVariant?: ButtonProps['variant']
}

export const ConfirmButton = ({
  children,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'destructive',
  ...triggerProps
}: ConfirmButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" {...triggerProps}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="min-h-11">
              {cancelLabel}
            </Button>
          </DialogClose>
          <AsyncButton
            className="min-h-11"
            variant={confirmVariant}
            onAction={async () => {
              await onConfirm()
              setOpen(false)
            }}
          >
            {confirmLabel}
          </AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
