'use client'

import {
  Dialog,
  DialogContent,
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
    (dialog: SuperActionDialog) => {
      const newRender = dialog && <SuperDialog dialog={dialog} />
      setRender(newRender)
    },
    [setRender],
  )
}

const SuperDialog = ({
  dialog,
}: {
  dialog: NonNullable<SuperActionDialog>
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
        </DialogContent>
      </Dialog>
    </>
  )
}
