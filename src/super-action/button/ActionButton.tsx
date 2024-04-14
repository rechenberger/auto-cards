'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'
import { UseSuperActionOptions, useSuperAction } from '../action/useSuperAction'
import { ActionCommand } from '../command/ActionCommand'
import { type ActionCommandConfig } from '../command/ActionCommandProvider'

export type ActionButtonProps = {
  children?: React.ReactNode
  component?: React.ElementType | typeof Button
  hideIcon?: boolean
  hideButton?: boolean
  command?: Omit<
    ActionCommandConfig,
    'action' | 'children' | 'askForConfirmation'
  > & {
    label?: ReactNode
  }
} & UseSuperActionOptions &
  ButtonProps

export const ActionButton = (props: ActionButtonProps) => {
  const {
    action,
    disabled,
    children,
    component: Component = Button,
    hideIcon,
    hideButton,
    catchToast,
    askForConfirmation,
    stopPropagation,
    command,
    ...buttonProps
  } = props
  const { isLoading, trigger } = useSuperAction({
    action,
    disabled,
    catchToast,
    askForConfirmation,
    stopPropagation,
  })
  const Icon = isLoading ? Loader2 : ArrowRight

  return (
    <>
      {!hideButton && (
        <Component
          type="button"
          disabled={isLoading || disabled}
          {...buttonProps}
          onClick={trigger}
        >
          {children}
          {!hideIcon && (
            <Icon className={cn('w-4 h-4 ml-2', isLoading && 'animate-spin')} />
          )}
        </Component>
      )}
      {command && (
        <ActionCommand
          icon={hideIcon ? undefined : Icon}
          {...command}
          action={trigger as any} // TODO: fix type
        >
          {command.label ?? children}
        </ActionCommand>
      )}
    </>
  )
}
