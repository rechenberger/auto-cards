import { constArrayMap } from '@/lib/constArrayMap'
import { keyBy } from 'lodash-es'
import { z } from 'zod'
import { GAME_VERSION, IGNORE_SPACE } from './config'
import { ItemDefinition } from './ItemDefinition'

const space = (space: number) => {
  return IGNORE_SPACE ? undefined : space
}

const allItemsConst = [
  {
    name: 'hero',
    tags: ['hero'],
    price: 0,
    shop: false,
    stats: {
      health: 50,
      healthMax: 50,
      stamina: 50,
      staminaMax: 50,
      staminaRegen: 10,
      critChance: 10,
      critDamage: 100,
      space: space(14),
    },
  },
  {
    name: 'experience',
    prompt:
      'a campfire in the foreground at the edge of a cliff overlooking a sunset',
    tags: ['hero'],
    price: 0,
    shop: false,
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
    shop: true,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          health: 4,
          stamina: 20,
        },
      },
    ],
  },
  {
    name: 'woodenSword',
    tags: ['weapon'],
    rarity: 'common',
    price: 3,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          stamina: 20,
        },
        statsSelf: {
          stamina: -20,
        },
        attack: {
          damage: 10,
          accuracy: 80,
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
    prompt: 'a small shield made of wood',
    tags: ['shield'],
    rarity: 'common',
    price: 4,
    shop: true,
    stats: {
      space: space(-4),
      // block: 30,
    },
    triggers: [
      // {
      //   type: 'interval',
      //   cooldown: 3_000,
      //   statsSelf: {
      //     block: 3,
      //   },
      // },
      {
        type: 'onDefendBeforeHit',
        chancePercent: 30,
        statsSelf: {
          block: 5,
        },
        statsEnemy: {
          stamina: -3,
        },
      },
    ],
  },
  {
    name: 'flyAgaric',
    tags: ['food'],
    rarity: 'uncommon',
    price: 3,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 4_000,
        statsTarget: {
          poison: 1,
        },
      },
    ],
  },
  {
    name: 'healingHerbs',
    prompt: 'a bouquet of healing herbs in a flower pot',
    tags: ['food'],
    rarity: 'common',
    price: 4,
    shop: true,
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
    shop: true,
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
    shop: true,
    stats: {
      space: space(-1),
      lifeSteal: 15,
    },
  },
  {
    name: 'balloon',
    prompt: 'hot air balloon flying in the skies',
    tags: ['accessory', 'hunting'],
    rarity: 'uncommon',
    price: 4,
    shop: true,
    unique: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'startOfBattle',
        forceStartTime: 1, // force 1 tick later, else fest might not reach
        statsSelf: {
          flying: 5,
        },
      },
    ],
  },
  {
    name: 'dagger',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 3,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 5,
        },
        statsSelf: {
          stamina: -5,
        },
        attack: {
          damage: 4,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
          unblockableChance: 10,
        },
      },
    ],
  },
  {
    name: 'fireDagger',
    prompt: 'a dagger with a fiery chili blade',
    tags: ['weapon'],
    rarity: 'rare',
    price: 8,
    shop: false,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 5,
        },
        statsSelf: {
          stamina: -5,
        },
        attack: {
          damage: 6,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
          unblockableChance: 10,
        },
        statsSelf: {
          haste: 5,
        },
      },
    ],
  },
  {
    name: 'ripsawBlade',
    prompt: 'a dark sword with big teeth like a saw',
    tags: ['weapon'],
    rarity: 'rare',
    price: 9,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 20,
        },
        statsSelf: {
          stamina: -20,
        },
        attack: {
          damage: 18,
          accuracy: 90,
        },
      },
      {
        type: 'onAttackAfterHit',
        statsTarget: {
          thorns: -2,
          regen: -2,
        },
      },
    ],
  },
  {
    name: 'spyglass',
    tags: ['accessory'],
    rarity: 'rare',
    price: 3,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsSelf: {
          aim: 10,
        },
      },
    ],
  },
  {
    name: 'beer',
    tags: ['food'],
    rarity: 'uncommon',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsSelf: {
          drunk: 1,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueMax: 3,
            valueAddingItems: ['beerFest'],
            valueMultiplier: 3,
            description:
              'Also attack with **3** *damage* and **90** *accuracy*\n\nwhen you have *beerFest*',
            sourceSide: 'self',
          },
          {
            arithmetic: 'add',
            targetStat: 'accuracy',
            targetStats: 'attack',
            valueMax: 90,
            valueAddingItems: ['beerFest'],
            valueMultiplier: 90,
            description: '',
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'beerFest',
    prompt:
      'people are celebrating beer fest, drinking and dancing. the word beer fest is written in letters of beer foam',
    tags: ['event'],
    rarity: 'rare',
    price: 2, // = beer
    shop: false,
    unique: true,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
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
    prompt:
      'people are celebrating the thorny things like thorny roses and thorny bushes. the word thorns fest is written as letters of rose stems.',
    tags: ['event'],
    rarity: 'rare',
    price: 4, // = roseBush
    shop: false,
    unique: true,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          thorns: 6,
        },
        statsEnemy: {
          thorns: 6,
        },
      },
    ],
  },
  {
    name: 'blockFest',
    prompt:
      'people are celebrating their shields and barricades. the word block fest is written as iron letters.',
    tags: ['event'],
    rarity: 'rare',
    price: 4, // = woodenBuckler
    shop: false,
    unique: true,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
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
    prompt:
      'people are celebrating the cold, ice and snow. the word frost fest is written as ice letters.',
    tags: ['event'],
    rarity: 'rare',
    price: 4, // = icicle
    shop: false,
    unique: true,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
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
    prompt: 'a hammer with a frosty head, covered in ice, dripping snowflakes',
    tags: ['weapon'],
    rarity: 'rare',
    price: 9,
    shop: true,
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
          stamina: 20,
        },
        statsSelf: {
          slow: 1,
          stamina: -20,
        },
        statsTarget: {
          slow: 5,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['slow'],
            sourceSide: 'enemy',
            description: '**+1** *damage* per *slow* on enemy',
          },
        ],
      },
    ],
  },
  {
    name: 'darts',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 3,
    shop: true,
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
          stamina: 2,
        },
        statsSelf: {
          stamina: -2,
        },
        attack: {
          accuracy: 80,
          damage: 1,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['flying'],
            valueMultiplier: 5,
            valueMax: 5,
            sourceSide: 'target',
            description: '**+5** *damage* if enemy has *flying*',
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsTarget: {
          flying: -1,
        },
      },
    ],
  },
  {
    name: 'whetstone',
    prompt: 'a whetstone for sharpening knives',
    tags: ['accessory'],
    rarity: 'rare',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
      critDamage: 15,
    },
  },
  {
    name: 'broom',
    tags: ['weapon'],
    rarity: 'common',
    price: 3,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        statsTarget: {
          blind: 3,
        },
        attack: {
          damage: 6,
          accuracy: 90,
        },
      },
    ],
  },
  {
    name: 'horseShoe',
    prompt: 'a horseshoe that is open at the top with a four leaf clover on it',
    tags: ['accessory'],
    rarity: 'common',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          luck: 2,
        },
      },
    ],
  },
  {
    name: 'energyDrink',
    prompt: 'a can of energy drink with a flexing biceps as logo',
    tags: ['potion'],
    rarity: 'common',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
      staminaMax: 20,
      stamina: 20,
    },
  },
  {
    name: 'thornsWhip',
    prompt:
      'a whip with thorns on the end, the handle is made of a thorny vine',
    tags: ['weapon'],
    rarity: 'rare',
    price: 7,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_500,
        statsRequired: {
          stamina: 25,
        },
        statsSelf: {
          stamina: -25,
        },
        attack: {
          damage: 15,
          accuracy: 80,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['thorns'],
            description: '**+1** *damage* per *thorns*',
            sourceSide: 'self',
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsSelf: {
          thorns: 1,
        },
      },
    ],
  },
  {
    name: 'pan',
    prompt:
      'a pan with a long handle, the pan is black and the handle is wooden',
    tags: ['weapon'],
    rarity: 'common',
    price: 4,
    shop: true,
    unique: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_200,
        statsRequired: {
          stamina: 15,
        },
        statsSelf: {
          stamina: -15,
        },
        attack: {
          damage: 8,
          accuracy: 85,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingTags: ['food'],
            description: '**+1** *damage* per *food*',
            sourceSide: 'self',
          },
          {
            arithmetic: 'add',
            targetStat: 'haste',
            targetStats: 'statsForItem',
            valueAddingStats: ['hungry'],
            description: 'Pan gets **+1** *haste* per *hungry*',
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'torch',
    prompt: 'an unlit torch with a wooden handle and a cloth on top',
    tags: ['weapon'],
    rarity: 'common',
    price: 5,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 6,
          accuracy: 90,
        },
      },
      {
        type: 'onAttackAfterHit',
        chancePercent: 30,
        statsSelf: {
          empower: 1,
        },
      },
    ],
  },
  {
    name: 'spear',
    prompt: 'a long spear with pointy tip',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 6,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 12,
          accuracy: 80,
        },
      },
      {
        type: 'onAttackBeforeHit',
        statsTarget: {
          block: -8,
        },
      },
    ],
  },
  {
    name: 'garlic',
    prompt: 'a garlic bulb with a strong smell',
    tags: ['food'],
    rarity: 'common',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 4_000,
        statsSelf: {
          block: 6,
        },
        statsTarget: {
          lifeSteal: -1,
        },
      },
    ],
  },
  {
    name: 'chiliPepper',
    prompt: 'a red chili pepper',
    tags: ['food'],
    rarity: 'common',
    price: 5,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 4_000,
        statsSelf: {
          haste: 2,
          health: 5,
        },
      },
    ],
  },
  {
    name: 'shortBow',
    prompt: 'a short bow and an arrow in a quiver standing next to each other',
    tags: ['weapon', 'hunting'],
    rarity: 'common',
    price: 4,
    shop: true,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 5,
          accuracy: 85,
        },
      },
    ],
  },
  {
    name: 'roseBush',
    prompt: 'a very thorny rose bush. thorns are sharp and pointy',
    tags: ['accessory'],
    rarity: 'common',
    price: 4,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          thorns: 2,
        },
      },
    ],
  },
  {
    name: 'thornBow',
    prompt: 'a bow and arrow made out of thorny wood',
    tags: ['weapon'],
    rarity: 'rare',
    price: 4 + 4, // shortBow + roseBush
    shop: false,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 5,
          accuracy: 85,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['thorns'],
            description: '**+0.5** *damage* per *thorns*',
            valueMultiplier: 0.5,
            sourceSide: 'self',
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsSelf: {
          thorns: 1,
        },
        chancePercent: 70,
      },
    ],
  },
  {
    name: 'luckyClover',
    prompt: 'a single lucky clover',
    tags: ['accessory'],
    rarity: 'common',
    price: 2,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          luck: 4,
        },
      },
    ],
  },
  {
    name: 'luckyBow',
    prompt: 'a bow and arrow made out of lucky clovers',
    tags: ['weapon'],
    rarity: 'rare',
    price: 8,
    shop: false,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 5,
          accuracy: 100,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['luck'],
            description: '**+0.2** *damage* per *luck*',
            valueMultiplier: 0.2,
            sourceSide: 'self',
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsSelf: {
          luck: 5,
        },
        chancePercent: 70,
      },
    ],
  },
  {
    name: 'poisonBow',
    prompt: 'a bow and arrow made out of fly agaric mushrooms',
    tags: ['weapon'],
    rarity: 'rare',
    price: 8,
    shop: false,
    stats: {
      space: space(-2),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 5,
          accuracy: 85,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['poison'],
            sourceSide: 'target',
            description: '**+0.5** *damage* per *poison* on enemy',
            valueMultiplier: 0.5,
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsTarget: {
          poison: 1,
        },
        chancePercent: 70,
      },
    ],
  },
  {
    name: 'leatherArmor',
    prompt: 'a leather armor on an armor stand',
    tags: ['accessory', 'hunting'],
    rarity: 'uncommon',
    price: 7,
    shop: true,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          block: 45,
        },
      },
    ],
  },
  {
    name: 'carrot',
    tags: ['food'],
    rarity: 'common',
    price: 3,
    shop: true,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          randomDebuff: -1,
        },
      },
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          luck: 5,
        },
        statsSelf: {
          empower: 1,
        },
        chancePercent: 50,
      },
    ],
  },
  {
    name: 'heartyDurian',
    prompt: 'a big ripe hearty durian fruit',
    tags: ['food', 'farming'],
    rarity: 'rare',
    price: 8,
    shop: true,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 4_000,
        statsSelf: {
          healthMax: 10,
          health: 10,
        },
      },
    ],
  },
  {
    name: 'forgingHammer',
    prompt: 'a small forging hammer',
    tags: ['weapon', 'smithing'],
    rarity: 'common',
    price: 3,
    shop: true,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_500,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 7,
          accuracy: 95,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['empower'],
            description: 'Additional **+1** *damage* per *empower*',
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'cursedPiggyBank',
    prompt: 'a bright pink piggy bank but with evil red eyes',
    tags: ['accessory'],
    rarity: 'common',
    price: 3,
    sellPrice: 0,
    shop: true,
    version: 2,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'onShopEntered',
        statsSelf: {
          gold: 1,
        },
      },
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          randomDebuff: 1,
        },
      },
    ],
  },
  // {
  //   name: 'mixer',
  //   prompt: 'a food mixer',
  //   tags: ['accessory'],
  //   rarity: 'rare',
  //   price: 5,
  //   shop: true,
  //   unique: true,
  //   triggers: [
  //     {
  //       type: 'startOfBattle',
  //       modifiers: [
  //         {
  //           arithmetic: 'add',
  //           targetStats: 'statsSelf',
  //           targetStat: 'hungry',
  //           description: 'Get **+10** *hungry* for every *food*',
  //           valueAddingTags: ['food'],
  //           valueMultiplier: 10,
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    name: 'metalGloves',
    prompt: 'a pair of metal gloves',
    tags: ['accessory'],
    rarity: 'rare',
    price: 4,
    shop: true,
    version: 2,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          empower: 1,
          haste: 3,
        },
      },
    ],
  },
  {
    name: 'longSword',
    prompt: 'a long sword with a shiny metal blade slashing through the air',
    tags: ['weapon'],
    rarity: 'epic',
    price: 3 + 4, // broadSword + metalGloves
    shop: false,
    version: 2,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_400,
        statsRequired: {
          stamina: 7,
        },
        statsSelf: {
          stamina: -7,
        },
        attack: {
          damage: 8,
          accuracy: 85,
        },
      },
      {
        type: 'startOfBattle',
        statsSelf: {
          empower: 1,
          haste: 8,
        },
      },
    ],
  },
  {
    name: 'bloodSword',
    prompt: 'a long sword with a drippy bloody blade',
    tags: ['weapon'],
    rarity: 'epic',
    price: 7,
    shop: true,
    version: 2,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_600,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 9,
          accuracy: 90,
        },
        modifiers: [
          {
            arithmetic: 'add',
            targetStat: 'damage',
            targetStats: 'attack',
            valueAddingStats: ['lifeSteal'],
            valueMultiplier: 0.1,
            description: 'Additional **+1** *damage* per 10 *lifeSteal*',
            sourceSide: 'self',
          },
        ],
      },
      {
        type: 'onAttackBeforeHit',
        statsRequired: {
          regen: 1,
        },
        statsSelf: {
          lifeSteal: 10,
          regen: -1,
        },
      },
      {
        type: 'startOfBattle',
        statsSelf: {
          lifeSteal: 10,
        },
      },
    ],
  },
  {
    name: 'crossBow',
    prompt: 'a heavy crossbow',
    tags: ['weapon'],
    rarity: 'epic',
    price: 4 + 6, // bow + spear
    shop: false,
    version: 2,
    stats: {
      space: space(-3),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 3_500,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 18,
          accuracy: 80,
        },
      },
      {
        type: 'onAttackBeforeHit',
        statsTarget: {
          block: -32,
        },
      },
    ],
  },
  {
    name: 'grapplingHook',
    prompt: 'a grappling hook ',
    tags: ['weapon'],
    rarity: 'epic',
    price: 5,
    shop: true,
    version: 2,
    stats: {
      space: space(-3),
    },
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 5,
        },
        statsSelf: {
          stamina: -5,
        },
        attack: {
          damage: 1,
          accuracy: 75,
        },
      },
      {
        type: 'onAttackBeforeHit',
        statsTarget: {
          randomBuff: -1,
        },
        description:
          'Steal **1** *randomBuff* on Hit.\n\nSteal another **1** *randomBuff* on Crit.',
      },
      {
        type: 'onAttackAfterHit',
        statsSelf: {
          randomBuff: 1,
        },
        hidden: true,
      },
      {
        type: 'onAttackCritBeforeHit',
        statsTarget: {
          randomBuff: -1,
        },
        hidden: true,
      },
      {
        type: 'onAttackCritAfterHit',
        statsSelf: {
          randomBuff: 1,
        },
        hidden: true,
      },
    ],
  },
  {
    name: 'foodPoison',
    prompt: 'a jar of food poison spilled into a bowl of food',
    tags: ['accessory'],
    rarity: 'rare',
    price: 6,
    shop: false,
    version: 2,
    triggers: [
      {
        type: 'startOfBattle',
        modifiers: [
          {
            arithmetic: 'add',
            sourceSide: 'enemy',
            targetStats: 'statsEnemy',
            targetStat: 'poison',
            description:
              'Apply **1** *poison*\n\nfor every *food*\n\nthe enemy has',
            valueAddingTags: ['food'],
            valueMultiplier: 1,
          },
        ],
      },
    ],
  },
  {
    name: 'manaSoup',
    prompt: 'a bowl of glowing blue mana soup',
    tags: ['food'],
    rarity: 'uncommon',
    price: 2,
    shop: true,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsSelf: {
          mana: 1,
        },
      },
    ],
  },
  {
    name: 'manaShield',
    prompt: 'a magical shield made out of mana',
    tags: ['shield'],
    rarity: 'rare',
    price: 4 + 4, // woodenBuckler + unstableManaCrystal
    shop: false,
    version: 2,
    triggers: [
      {
        type: 'onDefendBeforeHit',
        chancePercent: 30,
        statsSelf: {
          block: 5,
          mana: 3,
        },
        statsEnemy: {
          stamina: -3,
        },
      },
    ],
  },
  {
    name: 'unstableManaCrystal',
    prompt: 'an unstable mana crystal about to burst',
    tags: ['crystal'],
    rarity: 'uncommon',
    price: 4,
    shop: true,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 10_000,
        statsSelf: {
          health: -10,
        },
      },
    ],
  },
  {
    name: 'tinyManaReactor',
    prompt: 'a tiny mana reactor that consumes crystals to generate pure mana',
    tags: ['accessory'],
    rarity: 'epic',
    price: 6,
    shop: true,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 1_000,
        modifiers: [
          {
            arithmetic: 'add',
            targetStats: 'statsSelf',
            targetStat: 'mana',
            description: 'Generate **1** *mana* for every *crystal*',
            valueAddingTags: ['crystal'],
            valueMultiplier: 1,
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'manaSword',
    prompt: 'a sword made out of pure mana',
    tags: ['weapon'],
    rarity: 'rare',
    price: 7, // woodenSword + unstableManaCrystal
    shop: false,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 10,
          accuracy: 80,
        },
      },
      {
        type: 'onAttackAfterHit',
        statsRequired: { mana: 3 },
        statsSelf: {
          mana: -3,
          empower: 1,
        },
      },
    ],
  },
  {
    name: 'manaWings',
    prompt: 'a pair of wings made out of pure mana',
    tags: ['accessory'],
    rarity: 'epic',
    price: 8,
    shop: true,
    unique: true,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          mana: 3,
        },
        statsSelf: {
          mana: -3,
          flying: 2,
        },
      },
    ],
  },
  {
    name: 'manaBarrier',
    prompt: 'a magical dome of mana blocking incoming projectiles',
    tags: ['accessory'],
    rarity: 'epic',
    price: 8,
    shop: true,
    unique: true,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          mana: 3,
        },
        statsSelf: {
          mana: -3,
          block: 20,
        },
      },
    ],
  },
  {
    name: 'manaDagger',
    prompt: 'a dagger made out of pure mana',
    tags: ['weapon'],
    rarity: 'epic',
    price: 3 + 7, // dagger + unstableManaCrystal
    shop: false,
    version: 2,
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 5,
        },
        statsSelf: {
          stamina: -5,
        },
        attack: {
          damage: 6,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
          unblockableChance: 10,
        },
        statsSelf: {
          mana: 2,
        },
      },
    ],
  },
  {
    name: 'icicle',
    prompt: 'a sharp icicle thrown',
    tags: ['weapon'],
    rarity: 'uncommon',
    price: 4,
    shop: true,
    version: 2,
    statsItem: {
      ranged: 1,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 1_000,
        statsRequired: {
          stamina: 2,
        },
        statsSelf: {
          stamina: -2,
        },
        attack: {
          damage: 1,
          accuracy: 80,
        },
      },
      {
        type: 'onAttackAfterHit',
        statsTarget: {
          slow: 2,
        },
      },
    ],
  },
  {
    name: 'farmer',
    prompt: 'a male farmer on with a pitchfork sitting on a bale of hay',
    tags: ['profession'],
    price: 0,
    shop: true,
    version: 3,
    shopEffects: [
      {
        type: 'unlock',
        tags: ['farming'],
      },
    ],
    triggers: [
      {
        type: 'startOfBattle',
        modifiers: [
          {
            arithmetic: 'add',
            targetStats: 'statsSelf',
            targetStat: 'hungry',
            description: 'Get **+10** *hungry* for every *food*',
            valueAddingTags: ['food'],
            valueMultiplier: 10,
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'blacksmith',
    prompt: 'a female blacksmith forging at the anvil',
    tags: ['profession'],
    price: 0,
    shop: true,
    version: 3,
    shopEffects: [
      {
        type: 'boost',
        tags: ['weapon', 'shield'],
      },
      {
        type: 'unlock',
        tags: ['smithing'],
      },
    ],
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        modifiers: [
          {
            arithmetic: 'add',
            targetStats: 'statsSelf',
            targetStat: 'stamina',
            description: 'Get **+1** *stamina* for every *block*',
            valueAddingStats: ['block'],
            valueMultiplier: 1,
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  {
    name: 'hunter',
    prompt: 'a female hunter stalking the wilds',
    tags: ['profession'],
    price: 0,
    shop: true,
    version: 3,
    shopEffects: [
      {
        type: 'unlock',
        tags: ['hunting'],
      },
    ],
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsSelf: {
          critChance: 2,
        },
      },
    ],
  },
  {
    name: 'broadSword',
    tags: ['weapon'],
    rarity: 'common',
    price: 3, // = woodenSword
    shop: false,
    version: 3,
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        attack: {
          damage: 9,
          accuracy: 80,
        },
      },
    ],
  },
  {
    name: 'knightShield',
    prompt: 'a medium sized knight shield made of steel',
    tags: ['shield'],
    rarity: 'rare',
    price: 4, // = woodenBuckler
    shop: false,
    version: 3,
    stats: {
      space: space(-4),
      // block: 30,
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          block: 20,
        },
      },
      {
        type: 'onDefendBeforeHit',
        chancePercent: 40,
        statsRequired: {
          stamina: 2,
        },
        statsSelf: {
          block: 8,
          stamina: -2,
        },
        statsEnemy: {
          stamina: -5,
        },
      },
    ],
  },
  {
    name: 'towerShield',
    prompt: 'a large tower shield made of steel',
    tags: ['shield'],
    rarity: 'epic',
    price: 4 * 2, // = 2 * knightShield
    shop: false,
    version: 3,
    stats: {
      space: space(-4),
      // block: 30,
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          block: 40,
        },
      },
      {
        type: 'onDefendBeforeHit',
        chancePercent: 50,
        statsRequired: {
          stamina: 4,
        },
        statsSelf: {
          stamina: -4,
          block: 10,
        },
        statsEnemy: {
          stamina: -10,
        },
      },
    ],
  },
  {
    name: 'luckyCharm',
    prompt: 'a small lucky charm with a four leaf clover',
    tags: ['accessory'],
    rarity: 'rare',
    price: 5,
    shop: true,
    version: 3,
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        statsRequired: {
          luck: 10,
        },
        statsSelf: {
          luck: -10,
          critChance: 5,
        },
      },
    ],
  },
  {
    name: 'bloodAmulet',
    prompt: 'a red amulet with a drop of blood in the center',
    tags: ['accessory'],
    rarity: 'epic',
    price: 7,
    shop: true,
    version: 3,
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          lifeSteal: 20,
          healthMax: 20,
          health: 20,
        },
      },
    ],
  },
  {
    name: 'scarecrow',
    prompt: 'a friendly scarecrow on a field of crops',
    tags: ['friend', 'farming'],
    rarity: 'uncommon',
    price: 4,
    shop: true,
    unique: true,
    version: 3,
    statsItem: {
      health: 10,
      healthMax: 10,
      block: 10,
      priority: 10,
      // flying: 30,
    },
    triggers: [
      {
        type: 'startOfBattle',
        modifiers: [
          {
            arithmetic: 'add',
            targetStats: 'statsItem',
            targetStat: 'block',
            description: 'Get **+1** *block* per *food*',
            valueAddingTags: ['food'],
            valueMultiplier: 1,
            sourceSide: 'self',
          },
        ],
      },
    ],
  },
  // {
  //   name: 'bob',
  //   prompt: 'a friendly little ice dragon friend',
  //   tags: ['friend'],
  //   rarity: 'uncommon',
  //   price: 6,
  //   shop: true,
  //   unique: true,
  //   version: 2,
  //   statsItem: {
  //     health: 25,
  //     healthMax: 25,
  //     flying: 5,
  //     priority: 1,
  //     // flying: 30,
  //   },
  //   triggers: [
  //     {
  //       type: 'interval',
  //       cooldown: 3_000,
  //       attack: {
  //         damage: 10,
  //         accuracy: 85,
  //       },
  //       statsTarget: {
  //         slow: 10,
  //       },
  //     },
  //     {
  //       type: 'onDefendAfterHit',
  //       statsTarget: {
  //         slow: 10,
  //       },
  //     },
  //   ],
  // },
] as const satisfies ItemDefinition[]

export const allItemNames = constArrayMap(allItemsConst, 'name')
export const ItemName = z.enum(allItemNames)
export type ItemName = z.infer<typeof ItemName>

const allItems: ItemDefinition[] = allItemsConst.filter(
  (i: ItemDefinition) => !i.version || i.version <= GAME_VERSION,
)

export const getAllItems = async () => allItems

const itemByName = keyBy(allItems, (i) => i.name)

export const tryGetItemByName = async (name: string) => {
  const item = itemByName[name]
  return item
}

export const getItemByName = async (name: string): Promise<ItemDefinition> => {
  const item = await tryGetItemByName(name)
  if (!item) {
    // throw new Error(`Item not found: ${name}`)
    // console.warn(`Item not found: ${name}`)
    return {
      name,
      tags: ['deprecated'],
      price: 0,
      shop: false,
      description: 'Item was removed from the game',
    }
  }
  return item
}
