export const DEFAULT_ACTION_COMMAND_GROUP = 'Next Best Action' as const

export const actionCommandGroups = [
  DEFAULT_ACTION_COMMAND_GROUP,
  'In Game',
  'Admin Stuff',
  'Main Navigation',
  'Adding Cards',
  'Studio',
  'Hand Cards',
] as const
export type ActionCommandGroup = (typeof actionCommandGroups)[number]
