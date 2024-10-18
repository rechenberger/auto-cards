'use client'
import { CommandItem } from '@/components/ui/command'
import { ReactNode } from 'react'
import { useSuperAction } from '../action/useSuperAction'
import { SuperIcon } from '../button/SuperIcon'
import { ActionCommandConfig } from './ActionCommandProvider'

export const ActionCommandItem = ({
  command,
  onActionExecuted,
}: {
  command: Omit<ActionCommandConfig<unknown>, 'group'>
  onActionExecuted?: () => void
}) => {
  const { children, shortcut, icon, ...superActionOptions } = command
  const { isLoading, trigger } = useSuperAction(superActionOptions)

  return (
    <CommandItem
      disabled={isLoading}
      onSelect={async () => {
        await trigger(undefined)
        onActionExecuted?.()
      }}
      className="flex flex-row"
    >
      <div className="flex-1 flex flex-row">
        <SuperIcon icon={icon} isLoading={isLoading} className="mr-2" />
        {children}
      </div>
      {shortcut && (
        <>
          <div className="flex flex-row gap-0.5">
            {shortcut.shift && <Key>Shift</Key>}
            {shortcut.cmdCtrl && <Key>{getCmdCtrlKey()}</Key>}
            <Key>{shortcut.key.toUpperCase()}</Key>
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
