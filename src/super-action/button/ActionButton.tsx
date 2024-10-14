'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import { UseSuperActionOptions } from '../action/useSuperAction'
import { type ActionCommandConfig } from '../command/ActionCommandProvider'
import { ActionWrapper, ActionWrapperSlotProps } from './ActionWrapper'

export type ActionButtonProps<Comp extends typeof Button = typeof Button> = {
  children?: React.ReactNode
  component?: Comp
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
    component: Component = Button,
    hideButton,
    catchToast,
    askForConfirmation,
    stopPropagation,
    command,
    ...buttonProps
  } = props

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
          <TheButton {...buttonProps} />
        </ActionWrapper>
      )}
    </>
  )
}

const TheButton = forwardRef<
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
