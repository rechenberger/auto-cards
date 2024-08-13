'use client'

import { CommandGroup } from '@/components/ui/command'
import { atom, useAtomValue } from 'jotai'
import { groupBy, indexOf, map, orderBy } from 'lodash-es'
import { Fragment, ReactNode, useState } from 'react'
import {
  ActionCommandDialog,
  useActionCommandDialog,
} from './ActionCommandDialog'
import {
  ActionCommandGroup,
  DEFAULT_ACTION_COMMAND_GROUP,
  actionCommandGroups,
} from './ActionCommandGroups'
import { ActionCommandItem } from './ActionCommandItem'
import { ActionCommandKeyboardShortcut } from './ActionCommandKeyboardShortcut'

export type ActionCommandConfig = {
  children: ReactNode
  group?: ActionCommandGroup
  action: () => Promise<void>
  askForConfirmation?: boolean
  shortcut?: {
    key: string
    cmdCtrl?: true
    // alt?: true
    shift?: true
  }
}

type ActionCommandConfigs = Record<string, ActionCommandConfig>

export const actionCommandsAtom = atom<ActionCommandConfigs>({})

export const ActionCommandProvider = () => {
  const commands = useAtomValue(actionCommandsAtom)
  let groups = map(
    groupBy(
      commands,
      (command) => command.group || DEFAULT_ACTION_COMMAND_GROUP,
    ),
    (commands, group) => ({ commands, group }),
  )
  groups = orderBy(
    groups,
    ({ group }) => indexOf(actionCommandGroups, group),
    'asc',
  )

  const { open, setOpen } = useActionCommandDialog()

  const [loading, setLoading] = useState(false)

  return (
    <>
      <ActionCommandDialog open={open} setOpen={setOpen}>
        {map(groups, ({ commands, group }) => {
          return (
            <Fragment key={group}>
              <CommandGroup heading={group}>
                {map(commands, (command, id) => (
                  <Fragment key={id}>
                    <ActionCommandItem
                      disabled={loading}
                      command={{
                        ...command,
                        action: async () => {
                          setLoading(true)
                          if (
                            command.askForConfirmation &&
                            !confirm('Are you sure?')
                          )
                            return
                          await command.action()
                          setOpen(false)
                          setLoading(false)
                        },
                      }}
                    />
                  </Fragment>
                ))}
              </CommandGroup>
            </Fragment>
          )
        })}
      </ActionCommandDialog>
      {map(commands, (command, id) => (
        <Fragment key={id}>
          <ActionCommandKeyboardShortcut
            disabled={loading}
            command={{
              ...command,
              action: async () => {
                setLoading(true)
                if (command.askForConfirmation && !confirm('Are you sure?'))
                  return
                await command.action()
                setOpen(false)
                setLoading(false)
              },
            }}
          />
        </Fragment>
      ))}
    </>
  )
}
