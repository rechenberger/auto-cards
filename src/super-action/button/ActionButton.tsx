'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import { UseSuperActionOptions, useSuperAction } from '../action/useSuperAction'
import { ActionCommand } from '../command/ActionCommand'
import { type ActionCommandConfig } from '../command/ActionCommandProvider'

export type ActionButtonProps<Comp extends typeof Button = typeof Button> = {
  children?: React.ReactNode
  component?: Comp | 'button'
  hideIcon?: boolean
  hideButton?: boolean
  command?: Omit<
    ActionCommandConfig,
    'action' | 'children' | 'askForConfirmation'
  > & {
    label?: ReactNode
  }
} & UseSuperActionOptions &
  ComponentPropsWithoutRef<Comp>

export const ActionButton = <Comp extends typeof Button = typeof Button>(
  props: ActionButtonProps<Comp>,
) => {
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
    forceNeverStopLoading,
    ...buttonProps
  } = props
  const { isLoading, trigger } = useSuperAction({
    action,
    disabled,
    catchToast,
    askForConfirmation,
    stopPropagation,
    forceNeverStopLoading,
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
            <Icon className={cn('size-4 ml-2', isLoading && 'animate-spin')} />
          )}
        </Component>
      )}
      {command && (
        <ActionCommand
          icon={hideIcon ? undefined : Icon}
          isLoading={isLoading}
          {...command}
          action={trigger as any} // TODO: fix type
        >
          {command.label ?? children}
        </ActionCommand>
      )}
    </>
  )
}
