'use client'

import { Slot } from '@radix-ui/react-slot'
import { map } from 'lodash-es'
import { DOMAttributes, ReactNode, forwardRef } from 'react'
import { UseSuperActionOptions, useSuperAction } from '../action/useSuperAction'
import { ActionCommand } from '../command/ActionCommand'
import { ActionCommandConfig } from '../command/ActionCommandProvider'

type ReactEventHandler = Exclude<
  {
    [K in keyof DOMAttributes<HTMLElement>]: K extends `on${string}` ? K : never
  }[keyof DOMAttributes<HTMLElement>],
  undefined
>

export type ActionWrapperSlotProps = {
  loading?: 'true' // React 19 wants the key to be all lowercase and the value to be a string (when it's passed to a DOM element)
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
  icon?: ReactNode
} & UseSuperActionOptions<unknown, undefined>

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
      icon,
      ...slotProps
    } = props
    const { isLoading, trigger } = useSuperAction({
      action,
      disabled,
      catchToast,
      askForConfirmation,
      stopPropagation,
    })
    return (
      <>
        <ActionWrapperSlot
          ref={ref}
          disabled={isLoading || disabled}
          loading={isLoading ? 'true' : undefined}
          {...slotProps}
          {...Object.fromEntries(
            map(triggerOn, (superOn) => [
              superOn,
              (evt: MouseEvent) => trigger(undefined, evt),
            ]),
          )}
        >
          {children}
        </ActionWrapperSlot>
        {command && (
          <ActionCommand
            icon={icon}
            {...command}
            action={action}
            disabled={disabled}
            catchToast={catchToast}
            askForConfirmation={askForConfirmation}
            stopPropagation={stopPropagation}
          >
            {command.label ?? children}
          </ActionCommand>
        )}
      </>
    )
  },
)

ActionWrapper.displayName = 'ActionWrapper'
