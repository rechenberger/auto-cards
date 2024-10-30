import { flatMap, map } from 'remeda'
import { z } from 'zod'
import { Trigger } from './ItemDefinition'
import { rndInt } from './rndHelpers'
import { Tag } from './tags'

type AspectDefinitionRaw = {
  name: string
  value: (ctx: { rnd: number }) => number
  triggers: (ctx: { rnd: number; value: number }) => Trigger[]
  tags?: Tag[]
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
    tags: [
      'weapon',
      'accessory',
      'crystal',
      'potion',
      'shield',
      'food',
      'spell',
    ],
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
    name: 'healthItem',
    tags: ['friend'],
    value: ({ rnd }) => scale({ rnd, min: 20 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          health: value,
          healthMax: value,
        },
      },
    ],
  },
  {
    name: 'regenItem',
    tags: ['friend'],
    value: ({ rnd }) => scale({ rnd, min: 1 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          regen: value,
        },
      },
    ],
  },
  {
    name: 'stamina',
    tags: ['weapon', 'accessory', 'crystal', 'potion', 'shield', 'food'],
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
    tags: ['weapon', 'accessory', 'crystal', 'potion', 'shield', 'food'],
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
    tags: ['weapon'],
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
    tags: ['shield', 'armor', 'spell'],
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
    name: 'blockItem',
    tags: ['friend'],
    value: ({ rnd }) => scale({ rnd, min: 16 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          block: value,
        },
      },
    ],
  },
  {
    name: 'haste',
    tags: ['food', 'accessory', 'crystal', 'potion', 'spell'],
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
    tags: ['farming'],
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
    tags: ['weapon', 'spell'],
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
    tags: ['shield', 'armor'],
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
    name: 'thornsItem',
    tags: ['friend'],
    value: ({ rnd }) => scale({ rnd, min: 4 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          thorns: value,
        },
      },
    ],
  },
  {
    name: 'luck',
    tags: ['weapon', 'accessory', 'crystal', 'potion'],
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
    tags: ['weapon', 'accessory', 'crystal', 'potion'],
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
    tags: ['weapon', 'accessory', 'crystal', 'potion'],
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
    name: 'flying',
    tags: ['spell'],
    value: ({ rnd }) => scale({ rnd, min: 1 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          flying: value,
        },
      },
    ],
  },
  {
    name: 'heroPower',
    value: ({ rnd }) => scale({ rnd, min: 2, max: 3 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          health: value * 2,
          healthMax: value * 2,
          empower: Math.round(value / 2),
          haste: Math.round(value / 2),
        },
      },
    ],
  },
  {
    name: 'monsterPower',
    value: ({ rnd }) => scale({ rnd, min: 2, max: 3 }),
    triggers: ({ value }) => [
      {
        type: 'startOfBattle',
        statsItem: {
          health: value * 2,
          healthMax: value * 2,
          empower: Math.round(value / 2),
          haste: Math.round(value / 2),
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

export const calcAspects = (aspects: ItemAspect[]) => {
  return map(aspects, (aspect) => {
    const def = getAspectDef(aspect.name)
    const { rnd, multiplier } = aspect
    const value = Math.round(def.value({ rnd }) * (multiplier ?? 1))
    const valueMax = Math.round(
      def.value({ rnd: 0.999999 }) * (multiplier ?? 1),
    )
    const valuePercent = value / valueMax

    const triggers = def.triggers({
      rnd,
      value,
    })

    return {
      triggers,
      value,
      valueMax,
      valuePercent,
    }
  })
}

export const itemAspectsToTriggers = (aspects: ItemAspect[]) => {
  const calc = calcAspects(aspects)
  return flatMap(calc, (c) => c.triggers)
}
