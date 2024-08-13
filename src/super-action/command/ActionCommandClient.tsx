'use client'

import { useSetAtom } from 'jotai'
import { useId, useLayoutEffect } from 'react'
import {
  ActionCommandConfig,
  actionCommandsAtom,
} from './ActionCommandProvider'

export const ActionCommandClient = (command: ActionCommandConfig) => {
  useRegisterActionCommand({
    command,
  })
  return null
}

const useRegisterActionCommand = ({
  command,
}: {
  command: ActionCommandConfig
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
