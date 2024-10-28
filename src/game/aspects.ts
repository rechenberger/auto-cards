import { flatMap, map } from 'remeda'
import { z } from 'zod'
import { Trigger } from './ItemDefinition'
import { rndInt } from './rndHelpers'

type AspectDefinitionRaw = {
  name: string
  value: (ctx: { rnd: number }) => number
  triggers: (ctx: { rnd: number; value: number }) => Trigger[]
}

const scale = ({
  rnd,
  min,
  max = 3 * min,
}: {
  rnd: number
  min: number
  max?: number
}) => {
  return rndInt({ rnd: rnd, min, max })
}

export const allAspectsRaw = [
  {
    name: 'health',
    value: ({ rnd }) => scale({ rnd, min: 10 }),
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
    value: ({ rnd }) => scale({ rnd, min: 5 }),
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
    value: ({ rnd }) => scale({ rnd, min: 5 }),
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
    value: ({ rnd }) => scale({ rnd, min: 1 }),
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
    value: ({ rnd }) => scale({ rnd, min: 8 }),
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
    value: ({ rnd }) => scale({ rnd, min: 1 }),
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
    value: ({ rnd }) => scale({ rnd, min: 2 }),
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
    value: ({ rnd }) => scale({ rnd, min: 1 }),
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
    value: ({ rnd }) => scale({ rnd, min: 2 }),
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
    value: ({ rnd }) => scale({ rnd, min: 2 }),
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
    value: ({ rnd }) => scale({ rnd, min: 4 }),
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
    value: ({ rnd }) => scale({ rnd, min: 4 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          lifeSteal: value,
        },
      },
    ],
  },
  {
    name: 'monsterPower',
    value: ({ rnd }) => scale({ rnd, min: 4 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          health: value * 2,
          healthMax: value * 2,
          empower: value,
          haste: value,
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
  rnd: z.number(),
  multiplier: z.number().optional(),
})
export type ItemAspect = z.infer<typeof ItemAspect>

export const itemAspectsToTriggers = (aspects: ItemAspect[]) => {
  return flatMap(aspects, (aspect) => {
    const def = getAspectDef(aspect.name)
    const { rnd, multiplier } = aspect
    const value = def.value({ rnd }) * (multiplier ?? 1)
    return def.triggers({
      rnd,
      value,
    })
  })
}
