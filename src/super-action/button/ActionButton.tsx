'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import { UseSuperActionOptions } from '../action/useSuperAction'
import { type ActionCommandConfig } from '../command/ActionCommandProvider'
import { ActionWrapper, ActionWrapperSlotProps } from './ActionWrapper'

export type ActionButtonProps = {
  children?: React.ReactNode
  hideIcon?: boolean
  hideButton?: boolean
  command?: Omit<
    ActionCommandConfig,
    'action' | 'children' | 'askForConfirmation'
  > & {
    label?: ReactNode
  }
} & UseSuperActionOptions &
  ComponentPropsWithoutRef<typeof Button>

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => {
    const {
      action,
      disabled,
      hideButton,
      catchToast,
      askForConfirmation,
      stopPropagation,
      command,
      ...buttonProps
    } = props

    return (
      <>
        <ActionWrapper
          action={action}
          disabled={disabled}
          askForConfirmation={askForConfirmation}
          stopPropagation={stopPropagation}
          command={command}
          catchToast={catchToast}
          triggerOn={['onClick']}
        >
          {!hideButton && <InnerButton {...buttonProps} ref={ref} />}
        </ActionWrapper>
      </>
    )
  },
)

ActionButton.displayName = 'ActionButton'

const InnerButton = forwardRef<
  HTMLButtonElement,
  { hideIcon?: boolean } & ActionWrapperSlotProps
>(({ isLoading, children, hideIcon, ...props }, ref) => {
  const Icon = isLoading ? Loader2 : ArrowRight

  return (
    <Button type="button" {...props} ref={ref}>
      {children}
      {!hideIcon && (
        <Icon className={cn('w-4 h-4 ml-2', isLoading && 'animate-spin')} />
      )}
    </Button>
  )
})

InnerButton.displayName = 'InnerButton'
