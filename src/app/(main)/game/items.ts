import { Item } from './zod-schema'

const items: Item[] = [
  {
    id: 'hero',
    tags: ['hero'],
    price: 0,
    stats: {
      health: 20,
      stamina: 5,
      staminaRegen: 1,
      gold: 10,
      space: 5,
    },
  },
  {
    id: 'banana',
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
          health: 3,
          stamina: 2,
        },
      },
    ],
  },
  {
    id: 'woodenSword',
    tags: ['weapon'],
    price: 3,
    stats: {
      space: -2,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          stamina: -3,
        },
        attack: {
          damage: 3,
          accuracy: 70,
        },
      },
    ],
  },
  {
    id: 'leatherBag',
    tags: ['bag'],
    price: 4,
    stats: {
      space: 4,
    },
  },
  {
    id: 'woodenBuckler',
    tags: ['shield'],
    price: 4,
    stats: {
      space: -4,
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
]
