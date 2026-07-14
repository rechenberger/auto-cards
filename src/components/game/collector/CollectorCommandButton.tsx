'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CollectorCommand } from '@/contracts/collector-api'
import { cn } from '@/lib/utils'
import { ReactNode, useCallback, useEffect, useState } from 'react'

export type CollectorCommandHandler = (
  command: CollectorCommand,
) => Promise<unknown>

export const CollectorCommandButton = ({
  command,
  onCommand,
  pending,
  confirm,
  shortcut,
  accessibleLabel,
  compact = false,
  children,
  ...buttonProps
}: Omit<ButtonProps, 'onClick'> & {
  command: CollectorCommand
  onCommand: CollectorCommandHandler
  pending: boolean
  confirm?: { title: string; description?: ReactNode; action?: string }
  shortcut?: string
  accessibleLabel?: string
  compact?: boolean
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const run = useCallback(async () => {
    await onCommand(command)
    setConfirmOpen(false)
  }, [command, onCommand])

  useEffect(() => {
    if (!shortcut || buttonProps.disabled || pending) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.matches('input, textarea, select, [contenteditable="true"]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      event.preventDefault()
      if (confirm) setConfirmOpen(true)
      else void run()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [buttonProps.disabled, confirm, pending, run, shortcut])

  return (
    <>
      <Button
        {...buttonProps}
        type="button"
        aria-label={accessibleLabel}
        title={
          shortcut ? `${accessibleLabel ?? 'Action'} (${shortcut})` : undefined
        }
        disabled={buttonProps.disabled || pending}
        className={cn(
          compact
            ? [
                '!min-h-0 touch-manipulation [@media(pointer:coarse)]:!min-h-11',
                buttonProps.size === 'icon'
                  ? '!size-7 [@media(pointer:coarse)]:!size-11'
                  : '!h-auto [@media(pointer:coarse)]:!h-11',
              ]
            : 'min-h-11 touch-manipulation',
          buttonProps.className,
        )}
        onClick={() => {
          if (confirm) setConfirmOpen(true)
          else void run()
        }}
      >
        {children}
      </Button>
      {confirm && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirm.title}</DialogTitle>
              {confirm.description && (
                <DialogDescription asChild>
                  <div>{confirm.description}</div>
                </DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11"
                disabled={pending}
                onClick={() => void run()}
              >
                {confirm.action ?? 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
