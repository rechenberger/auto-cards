'use client'

import { useSetAtom } from 'jotai'
import { useId, useLayoutEffect } from 'react'
import {
  ActionCommandConfig,
  actionCommandsAtom,
} from './ActionCommandProvider'

export const ActionCommandClient = (props: ActionCommandConfig<unknown>) => {
  useRegisterActionCommand({
    command: props,
  })
  return null
}

const useRegisterActionCommand = ({
  command,
}: {
  command: ActionCommandConfig<unknown>
}) => {
  const id = useId()
  const setCommands = useSetAtom(actionCommandsAtom)

  useLayoutEffect(() => {
    setCommands((prev) => ({ ...prev, [id]: command }))
    return () => {
      setCommands((prev) => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    }
  })
}
