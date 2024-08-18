import { ItemDefinition } from './ItemDefinition'

const allItemsConst = [
  {
    name: 'hero',
    tags: ['hero'],
    price: 0,
    stats: {
      health: 50,
      stamina: 5,
      staminaRegen: 1,
      space: 14,
    },
  },
  {
    name: 'banana',
    tags: ['food'],
    price: 3,
    stats: {
      space: -3,
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
      space: -2,
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
    price: 4,
    stats: {
      space: 4,
    },
  },
  {
    name: 'woodenBuckler',
    tags: ['shield'],
    price: 4,
    stats: {
      space: -4,
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
      space: -2,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 10_000,
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
      space: -1,
      regen: 2,
    },
  },
  {
    name: 'pineapple',
    tags: ['food'],
    price: 7,
    stats: {
      space: -3,
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
      space: -1,
      lifeSteal: 20,
    },
  },
  {
    name: 'balloon',
    tags: ['accessory'],
    price: 4,
    stats: {
      space: -2,
      flying: 5,
    },
  },
  {
    name: 'dagger',
    tags: ['weapon'],
    price: 3,
    stats: {
      space: -2,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsSelf: {
          haste: 5,
        },
        attack: {
          damage: 4,
          accuracy: 70,
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
