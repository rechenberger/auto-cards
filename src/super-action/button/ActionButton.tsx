'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
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
  asChild?: boolean
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
      asChild,
      ...buttonProps
    } = props

    const Comp = asChild ? Slot : IconButton

    return (
      <>
        {!hideButton && (
          <ActionWrapper
            action={action}
            disabled={disabled}
            askForConfirmation={askForConfirmation}
            stopPropagation={stopPropagation}
            command={command}
            catchToast={catchToast}
            triggerOn={['onClick']}
          >
            <Comp {...buttonProps} ref={ref} />
          </ActionWrapper>
        )}
      </>
    )
  },
)

const IconButton = forwardRef<
  HTMLButtonElement,
  { hideIcon?: boolean; asChild?: boolean } & ActionWrapperSlotProps
>(({ isLoading, children, hideIcon, asChild, ...props }, ref) => {
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
