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
    rarity: 'common',
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
    rarity: 'common',
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
  // {
  //   name: 'leatherBag',
  //   tags: ['bag'],
  //   price: IGNORE_SPACE ? 0 : 4,
  //   stats: {
  //     space: space(4),
  //   },
  // },
  {
    name: 'woodenBuckler',
    tags: ['shield'],
    rarity: 'common',
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
    rarity: 'uncommon',
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
    rarity: 'common',
    price: 4,
    stats: {
      space: space(-1),
      regen: 2,
    },
  },
  {
    name: 'pineapple',
    tags: ['food'],
    rarity: 'uncommon',
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
    rarity: 'uncommon',
    price: 4,
    stats: {
      space: space(-1),
      lifeSteal: 20,
    },
  },
  {
    name: 'balloon',
    tags: ['accessory'],
    rarity: 'uncommon',
    price: 4,
    stats: {
      space: space(-2),
      flying: 5,
    },
  },
  {
    name: 'dagger',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsItem: {
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
    rarity: 'rare',
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
    rarity: 'rare',
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
    rarity: 'uncommon',
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
    rarity: 'rare',
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
  {
    name: 'thornsFest',
    tags: ['event'],
    rarity: 'rare',
    price: 8,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
        cooldown: 0,
        statsSelf: {
          thorns: 20,
        },
        statsEnemy: {
          thorns: 20,
        },
      },
    ],
  },
  {
    name: 'blockFest',
    tags: ['event'],
    rarity: 'rare',
    price: 8,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
        cooldown: 0,
        statsSelf: {
          block: 100,
        },
        statsEnemy: {
          block: 100,
        },
      },
    ],
  },
  {
    name: 'frostFest',
    tags: ['event'],
    rarity: 'rare',
    price: 8,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
        cooldown: 0,
        statsSelf: {
          slow: 20,
        },
        statsEnemy: {
          slow: 20,
        },
      },
    ],
  },
  {
    name: 'frostHammer',
    tags: ['weapon'],
    rarity: 'rare',
    price: 6,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        attack: {
          accuracy: 80,
          damage: 20,
        },
        statsRequired: {
          stamina: 4,
        },
        statsSelf: {
          slow: 5,
          stamina: -4,
        },
        statsEnemy: {
          slow: 5,
        },
      },
      {
        type: 'interval',
        cooldown: 3_000,
        attack: {
          accuracy: 80,
          damage: 20,
        },
        statsRequired: {
          slow: 20,
        },
        statsSelf: {
          slow: -20,
        },
      },
    ],
  },
  {
    name: 'darts',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 3,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_000,
        statsRequired: {
          stamina: 1,
        },
        statsSelf: {
          stamina: -1,
        },
        attack: {
          accuracy: 80,
          damage: 2,
        },
        statsEnemy: {
          flying: -1,
        },
      },
    ],
  },
  {
    name: 'whetstone',
    tags: ['accessory'],
    rarity: 'rare',
    price: 2,
    stats: {
      space: space(-2),
      critDamage: 30,
    },
  },
  {
    name: 'broom',
    tags: ['weapon'],
    rarity: 'common',
    price: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 2,
        },
        statsSelf: {
          stamina: -2,
        },
        statsEnemy: {
          blind: 4,
        },
        attack: {
          damage: 2,
          accuracy: 80,
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
    // throw new Error(`Item not found: ${name}`)
    console.warn(`Item not found: ${name}`)
    return {
      name,
      tags: [],
      price: 0,
    }
  }
  return item
}
