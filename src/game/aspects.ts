import { flatMap, map } from 'remeda'
import { z } from 'zod'
import { Trigger } from './ItemDefinition'
import { rndInt } from './rndHelpers'

type AspectDefinitionRaw = {
  name: string
  value: (ctx: { power: number }) => number
  triggers: (ctx: { power: number; value: number }) => Trigger[]
}

const scale = ({
  power,
  min,
  max = 3 * min,
}: {
  power: number
  min: number
  max?: number
}) => {
  return rndInt({ rnd: power, min, max })
}

export const allAspectsRaw = [
  {
    name: 'health',
    value: ({ power }) => scale({ power, min: 10 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          health: value,
          healthMax: value,
        },
      },
    ],
  },
  {
    name: 'stamina',
    value: ({ power }) => scale({ power, min: 5 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          stamina: value,
          staminaMax: value,
        },
      },
    ],
  },
  {
    name: 'staminaRegen',
    value: ({ power }) => scale({ power, min: 5 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          staminaRegen: value,
        },
      },
    ],
  },
  {
    name: 'critChance',
    value: ({ power }) => scale({ power, min: 1 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          critChance: value,
        },
      },
    ],
  },
  {
    name: 'block',
    value: ({ power }) => scale({ power, min: 8 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          block: value,
        },
      },
    ],
  },
  {
    name: 'haste',
    value: ({ power }) => scale({ power, min: 1 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          haste: value,
        },
      },
    ],
  },
  {
    name: 'hungry',
    value: ({ power }) => scale({ power, min: 2 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          hungry: value,
        },
      },
    ],
  },
  {
    name: 'empower',
    value: ({ power }) => scale({ power, min: 1 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          empower: value,
        },
      },
    ],
  },
  {
    name: 'thorns',
    value: ({ power }) => scale({ power, min: 2 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          thorns: value,
        },
      },
    ],
  },
  {
    name: 'luck',
    value: ({ power }) => scale({ power, min: 2 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          luck: value,
        },
      },
    ],
  },
  {
    name: 'critDamage',
    value: ({ power }) => scale({ power, min: 4 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          critDamage: value,
        },
      },
    ],
  },
  {
    name: 'lifeSteal',
    value: ({ power }) => scale({ power, min: 4 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          lifeSteal: value,
        },
      },
    ],
  },
] as const satisfies AspectDefinitionRaw[]

export const allAspectNames = map(allAspectsRaw, (aspect) => aspect.name)
export const AspectName = z.enum(allAspectNames)
export type AspectName = z.infer<typeof AspectName>

export type AspectDefinition = AspectDefinitionRaw & {
  name: AspectName
}

export const allAspects: AspectDefinition[] = allAspectsRaw

export const getAspectDef = (name: AspectName) => {
  const def = allAspects.find((a) => a.name === name)
  if (!def) {
    throw new Error(`Aspect definition not found: ${name}`)
  }
  return def
}

export const ItemAspect = z.object({
  name: AspectName,
  power: z.number(),
})
export type ItemAspect = z.infer<typeof ItemAspect>

export const itemAspectsToTriggers = (aspects: ItemAspect[]) => {
  return flatMap(aspects, (aspect) => {
    const def = getAspectDef(aspect.name)
    const { power } = aspect
    const value = def.value({ power })
    return def.triggers({
      power,
      value,
    })
  })
}
