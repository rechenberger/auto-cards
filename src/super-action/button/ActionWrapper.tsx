'use client'

import { Slot } from '@radix-ui/react-slot'
import { map } from 'lodash-es'
import { ArrowRight, Loader2 } from 'lucide-react'
import { DOMAttributes, forwardRef, ReactNode } from 'react'
import { useSuperAction, UseSuperActionOptions } from '../action/useSuperAction'
import { ActionCommand } from '../command/ActionCommand'
import { ActionCommandConfig } from '../command/ActionCommandProvider'

type ReactEventHandler = Exclude<
  {
    [K in keyof DOMAttributes<HTMLElement>]: K extends `on${string}` ? K : never
  }[keyof DOMAttributes<HTMLElement>],
  undefined
>

export type ActionWrapperSlotProps = {
  isLoading?: boolean
  disabled?: boolean
  children?: ReactNode
}

const ActionWrapperSlot = forwardRef<HTMLElement, ActionWrapperSlotProps>(
  (props, ref) => {
    return <Slot {...props} ref={ref} />
  },
)

export type ActionWrapperProps = {
  children?: React.ReactNode
  command?: Omit<
    ActionCommandConfig,
    'action' | 'children' | 'askForConfirmation'
  > & {
    label?: ReactNode
  }
  triggerOn?: ReactEventHandler[]
} & UseSuperActionOptions

ActionWrapperSlot.displayName = 'ActionWrapperSlot'

export const ActionWrapper = forwardRef<HTMLElement, ActionWrapperProps>(
  (props, ref) => {
    const {
      action,
      disabled,
      children,
      catchToast,
      askForConfirmation,
      stopPropagation,
      command,
      triggerOn = ['onClick'],
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
        <ActionWrapperSlot
          ref={ref}
          disabled={isLoading || disabled}
          isLoading={isLoading}
          {...buttonProps}
          {...Object.fromEntries(
            map(triggerOn, (superOn) => [superOn, trigger]),
          )}
        >
          {children}
        </ActionWrapperSlot>
        {command && (
          <ActionCommand
            icon={Icon}
            {...command}
            action={trigger as any} // TODO: fix type
          >
            {command.label ?? children}
          </ActionCommand>
        )}
      </>
    )
  },
)

ActionWrapper.displayName = 'ActionWrapper'
