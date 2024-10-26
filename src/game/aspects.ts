import { Trigger } from './ItemDefinition'
import { rndInt } from './rndHelpers'

type AspectDefinitionRaw = {
  name: string
  triggers: ({ rnd }: { rnd: number }) => Partial<Trigger[]>
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
  return rndInt({ rnd, min, max })
}

export const allAspectsRaw = [
  {
    name: 'health',
    triggers: ({ rnd }) => [
      {
        type: 'startOfBattle',
        stats: {
          health: scale({ rnd, min: 10 }),
          healthMax: scale({ rnd, min: 10 }),
        },
      },
    ],
  },
  {
    name: 'stamina',
    triggers: ({ rnd }) => [
      {
        type: 'startOfBattle',
        stats: {
          stamina: scale({ rnd, min: 10 }),
          staminaMax: scale({ rnd, min: 10 }),
        },
      },
    ],
  },
] as const satisfies AspectDefinitionRaw[]
