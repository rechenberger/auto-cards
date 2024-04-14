'use client'
import { useEffect } from 'react'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandKeyboardShortcut = ({
  command,
  disabled,
}: {
  command: ActionCommandConfig
  disabled?: boolean
}) => {
  const { action, shortcut } = command

  useEffect(() => {
    if (disabled) return
    if (!shortcut) return
    const down = (e: KeyboardEvent) => {
      if (e.target !== document.body) return
      if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return
      if (shortcut.cmdCtrl && (!e.metaKey || !e.ctrlKey)) return
      if (shortcut.shift && !e.shiftKey) return
      // if (shortcut.alt && !e.altKey) return

      e.preventDefault()
      action()
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [action, disabled, shortcut])

  return null
}
