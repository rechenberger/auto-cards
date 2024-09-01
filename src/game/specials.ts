import { constArrayMap } from '@/lib/constArrayMap'
import { z } from 'zod'

export const allSpecialDefinitions = [
  {
    name: 'attack_twice',
    description: 'Attack twice.',
  },
  {
    name: 'strength_counts_double',
    description: 'Strength counts double for this item.',
  },
] as const

export const allTags = constArrayMap(allSpecialDefinitions, 'name')

export const Special = z.enum(allTags)
export type Special = z.infer<typeof Special>

export const getSpecialDefinition = (special: Special) => {
  const def = allSpecialDefinitions.find((b) => b.name === special)
  if (!def) {
    throw new Error(`Unknown special: ${special}`)
  }
  return def
}
