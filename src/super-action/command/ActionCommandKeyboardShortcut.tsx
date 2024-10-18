'use client'
import { useEffect } from 'react'
import { useSuperAction } from '../action/useSuperAction'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandKeyboardShortcut = ({
  command,
  onActionExecuted,
}: {
  command: Omit<ActionCommandConfig<unknown>, 'children' | 'group'>
  onActionExecuted?: () => void
}) => {
  const { shortcut, ...superActionOptions } = command
  const { trigger } = useSuperAction(superActionOptions)

  useEffect(() => {
    if (!shortcut) return
    const down = async (e: KeyboardEvent) => {
      if (e.target !== document.body) return
      if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return
      if (shortcut.cmdCtrl && (!e.metaKey || !e.ctrlKey)) return
      if (shortcut.shift && !e.shiftKey) return
      // if (shortcut.alt && !e.altKey) return

      e.preventDefault()
      await trigger(undefined)
      onActionExecuted?.()
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [shortcut, trigger])

  return null
}
