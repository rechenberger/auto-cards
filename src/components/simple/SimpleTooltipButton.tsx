import {
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import {
  ActionButton,
  ActionButtonProps,
} from '@/super-action/button/ActionButton'
import { ReactNode } from 'react'
import { SimpleTooltip } from './SimpleTooltip'

export const SimpleTooltipButton = ({
  tooltip,
  ...buttonProps
}: {
  tooltip: ReactNode
} & Omit<ActionButtonProps, 'action'>) => {
  return (
    <SimpleTooltip tooltip={tooltip}>
      <ActionButton
        {...buttonProps}
        action={async () => {
          'use server'
          return superAction(async () => {
            streamToast({
              description: tooltip,
            })
          })
        }}
      />
    </SimpleTooltip>
  )
}
