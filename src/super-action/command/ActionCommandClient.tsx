'use client'

import { useSetAtom } from 'jotai'
import { useId, useLayoutEffect } from 'react'
import {
  ActionCommandConfig,
  actionCommandsAtom,
} from './ActionCommandProvider'

export const ActionCommandClient = <Result,>(
  props: ActionCommandConfig<Result>,
) => {
  useRegisterActionCommand({
    command: props,
  })
  return null
}

const useRegisterActionCommand = <Result,>({
  command,
}: {
  command: ActionCommandConfig<Result>
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
