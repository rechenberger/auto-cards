import { IGNORE_SPACE } from './config'
import { ItemDefinition } from './ItemDefinition'

const space = (space: number) => {
  return IGNORE_SPACE ? undefined : space
}

const allItemsConst = [
  {
    name: 'hero',
    tags: ['hero'],
    price: 0,
    stats: {
      health: 50,
      healthMax: 50,
      stamina: 5,
      staminaMax: 5,
      staminaRegen: 1,
      space: space(14),
    },
  },
  {
    name: 'experience',
    tags: ['hero'],
    price: 0,
    stats: {
      health: 20,
      healthMax: 20,
    },
  },
  {
    name: 'banana',
    tags: ['food'],
    price: 3,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          health: 4,
          stamina: 2,
        },
      },
    ],
  },
  {
    name: 'woodenSword',
    tags: ['weapon'],
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          stamina: 3,
        },
        statsSelf: {
          stamina: -3,
        },
        attack: {
          damage: 6,
          accuracy: 70,
        },
      },
    ],
  },
  {
    name: 'leatherBag',
    tags: ['bag'],
    price: IGNORE_SPACE ? 0 : 4,
    stats: {
      space: space(4),
    },
  },
  {
    name: 'woodenBuckler',
    tags: ['shield'],
    price: 4,
    stats: {
      space: space(-4),
      block: 30,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          block: 3,
        },
      },
    ],
  },
  {
    name: 'flyAgaric',
    tags: ['food'],
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsEnemy: {
          poison: 1,
        },
      },
    ],
  },
  {
    name: 'healingHerbs',
    tags: ['food'],
    price: 4,
    stats: {
      space: space(-1),
      regen: 2,
    },
  },
  {
    name: 'pineapple',
    tags: ['food'],
    price: 7,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          thorns: 2,
          health: 6,
        },
      },
    ],
  },
  {
    name: 'syringe',
    tags: ['accessory'],
    price: 4,
    stats: {
      space: space(-1),
      lifeSteal: 20,
    },
  },
  {
    name: 'balloon',
    tags: ['accessory'],
    price: 4,
    stats: {
      space: space(-2),
      flying: 5,
    },
  },
  {
    name: 'dagger',
    tags: ['weapon'],
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsSelf: {
          haste: 2,
        },
        attack: {
          damage: 4,
          accuracy: 70,
        },
      },
    ],
  },
  {
    name: 'ripsawBlade',
    tags: ['weapon'],
    price: 10,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 2,
        },
        statsSelf: {
          stamina: -2,
        },
        statsEnemy: {
          thorns: -2,
          regen: -2,
        },
        attack: {
          damage: 18,
          accuracy: 90,
        },
      },
    ],
  },
  {
    name: 'spyglass',
    tags: ['accessory'],
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_000,
        statsSelf: {
          aim: 5,
        },
      },
    ],
  },
  {
    name: 'beer',
    tags: ['food'],
    price: 5,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_000,
        statsSelf: {
          drunk: 1,
        },
      },
    ],
  },
  {
    name: 'beerFest',
    tags: ['event'],
    price: 8,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
        cooldown: 0,
        statsSelf: {
          drunk: 20,
        },
        statsEnemy: {
          drunk: 20,
        },
      },
    ],
  },
] as const satisfies ItemDefinition[]

export type ItemName = (typeof allItemsConst)[number]['name']
const allItems: ItemDefinition[] = allItemsConst

export const getAllItems = async () => allItems
export const getItemByName = async (name: string) => {
  const item = allItems.find((item) => item.name === name)
  if (!item) {
    throw new Error(`Item not found: ${name}`)
  }
  return item
}
