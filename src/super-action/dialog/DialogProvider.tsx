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
    async (
      dialog: SuperActionDialog,
      withConfirm?: { confirmLabel?: string },
    ) => {
      const confirm = await new Promise<boolean>((res) => {
        const newRender = dialog && (
          <SuperDialog
            dialog={dialog}
            confirm={res}
            withConfirm={withConfirm}
          />
        )
        setRender(newRender)
      })
      return confirm
    },
    [setRender],
  )
}

const SuperDialog = ({
  dialog,
  confirm,
  withConfirm,
}: {
  dialog: NonNullable<SuperActionDialog>
  confirm?: (value: boolean) => void
  withConfirm?: { confirmLabel?: string }
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
          {withConfirm && (
            <DialogFooter>
              <Button variant={'outline'} onClick={() => confirm?.(false)}>
                Abbrechen
              </Button>
              <Button onClick={() => confirm?.(true)}>
                {withConfirm?.confirmLabel ?? 'Ja'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
