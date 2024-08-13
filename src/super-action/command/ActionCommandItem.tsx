'use client'
import { CommandItem } from '@/components/ui/command'
import { ReactNode } from 'react'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandItem = ({
  command,
  disabled,
}: {
  command: ActionCommandConfig
  disabled?: boolean
}) => {
  return (
    <CommandItem
      disabled={disabled}
      onSelect={command.action}
      className="flex flex-row"
    >
      <div className="flex-1 flex flex-row">{command.children}</div>
      {command.shortcut && (
        <>
          <div className="flex flex-row gap-0.5">
            {command.shortcut.shift && <Key>Shift</Key>}
            {command.shortcut.cmdCtrl && <Key>{getCmdCtrlKey()}</Key>}
            <Key>{command.shortcut.key.toUpperCase()}</Key>
          </div>
        </>
      )}
    </CommandItem>
  )
}

const Key = ({ children }: { children?: ReactNode }) => {
  return (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      {children}
    </kbd>
  )
}

const getCmdCtrlKey = () => {
  if (
    typeof navigator !== 'undefined' &&
    'platform' in navigator &&
    navigator.platform.includes('Mac')
  ) {
    return '⌘'
  }
  return 'Ctrl'
}
