import { map } from 'remeda'
import { z } from 'zod'
import { Trigger } from './ItemDefinition'
import { rndInt } from './rndHelpers'

type AspectDefinitionRaw = {
  name: string
  triggers: (ctx: { power: number }) => Trigger[]
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
    triggers: ({ power }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          health: scale({ power, min: 10 }),
          healthMax: scale({ power, min: 10 }),
        },
      },
    ],
  },
  {
    name: 'stamina',
    triggers: ({ power }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          stamina: scale({ power, min: 5 }),
          staminaMax: scale({ power, min: 5 }),
        },
      },
    ],
  },
  {
    name: 'staminaRegen',
    triggers: ({ power }) => [
      {
        type: 'startOfBattle',
        statsSelf: {
          staminaRegen: scale({ power, min: 5 }),
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
