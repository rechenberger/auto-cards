'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { ReactNode, useEffect, useState } from 'react'

export const useActionCommandDialog = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return {
    open,
    setOpen,
  }
}

export const ActionCommandDialog = ({
  children,
  open,
  setOpen,
}: {
  children?: ReactNode
  open: boolean
  setOpen: (v: boolean) => void
}) => (
  <>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {children}
      </CommandList>
    </CommandDialog>
  </>
)
