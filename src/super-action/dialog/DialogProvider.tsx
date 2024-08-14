'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'
import { SuperActionDialog } from '../action/createSuperAction'

const renderAtom = atom<ReactNode>(null)

export const DialogProvider = () => {
  const render = useAtomValue(renderAtom)
  return <>{render}</>
}

export const useShowDialog = () => {
  const setRender = useSetAtom(renderAtom)
  return useCallback(
    async (dialog: SuperActionDialog) => {
      const confirmed = await new Promise<boolean>((res) => {
        const newRender = dialog && (
          <SuperDialog dialog={dialog} onConfirm={res} />
        )
        setRender(newRender)
      })
      setRender(null) // close dialog on confirm
      return confirmed
    },
    [setRender],
  )
}

const SuperDialog = ({
  dialog,
  onConfirm,
}: {
  dialog: NonNullable<SuperActionDialog>
  onConfirm?: (value: boolean) => void
}) => {
  const setRender = useSetAtom(renderAtom)
  return (
    <>
      <Dialog
        defaultOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            setRender(null)
          }
        }}
      >
        <DialogContent>
          {dialog.title && (
            <DialogHeader>
              <DialogTitle>{dialog.title}</DialogTitle>
            </DialogHeader>
          )}
          {dialog.content}
          {(!!dialog.confirm || !!dialog.cancel) && (
            <DialogFooter>
              {dialog.cancel && (
                <Button variant={'outline'} onClick={() => onConfirm?.(false)}>
                  {dialog.cancel}
                </Button>
              )}
              {dialog.confirm && (
                <Button onClick={() => onConfirm?.(true)} autoFocus>
                  {dialog.confirm}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
