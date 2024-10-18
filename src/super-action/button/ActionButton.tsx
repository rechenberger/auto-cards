'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'
import {
  ActionWrapper,
  ActionWrapperProps,
  ActionWrapperSlotProps,
} from './ActionWrapper'

export type ActionButtonProps = {
  hideIcon?: boolean
  hideButton?: boolean
} & ActionWrapperProps &
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
