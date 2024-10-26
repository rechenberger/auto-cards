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
        stats: {
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
        stats: {
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
        stats: {
          staminaRegen: scale({ power, min: 5 }),
        },
      },
    ],
  },
] as const satisfies AspectDefinitionRaw[]
