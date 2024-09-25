import { constArrayMap } from '@/lib/constArrayMap'
import { keyBy } from 'lodash-es'
import { z } from 'zod'
import { IGNORE_SPACE, NEXT_PHASE } from './config'
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
        statsEnemy: {
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
      lifeSteal: 20,
    },
  },
  {
    name: 'balloon',
    prompt: 'hot air balloon flying in the skies',
    tags: ['accessory'],
    rarity: 'uncommon',
    price: 4,
    shop: true,
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
    statsItem: {
      unblockable: 1,
      critChance: 30,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        attack: {
          damage: 6,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
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
    statsItem: {
      unblockable: 1,
      critChance: 30,
      haste: 30,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        attack: {
          damage: 6,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
          haste: 10,
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
        statsEnemy: {
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
        cooldown: 1_000,
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
              'Also attack with **3** *damage* and **90** *accuracy* when you have *beerFest*',
          },
          {
            arithmetic: 'add',
            targetStat: 'accuracy',
            targetStats: 'attack',
            valueMax: 90,
            valueAddingItems: ['beerFest'],
            valueMultiplier: 90,
            description: '',
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
    price: 8,
    shop: true,
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
    price: 8,
    shop: true,
    stats: {
      space: space(-4),
    },
    triggers: [
      {
        type: 'startOfBattle',
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
    prompt:
      'people are celebrating their shields and barricades. the word block fest is written as iron letters.',
    tags: ['event'],
    rarity: 'rare',
    price: 8,
    shop: true,
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
    price: 8,
    shop: true,
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
          stamina: 30,
        },
        statsSelf: {
          slow: 5,
          stamina: -30,
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
        attack: {
          accuracy: 80,
          damage: 2,
        },
      },
      {
        type: 'onAttackAfterHit',
        statsEnemy: {
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
      critDamage: 30,
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
          stamina: 10,
        },
        statsSelf: {
          stamina: -10,
        },
        statsEnemy: {
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
          // randomBuff: 3,
          // randomDebuff: -3,
        },
        // statsEnemy: {
        //   randomBuff: -3,
        //   randomDebuff: 3,
        // },
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
    stats: {
      space: space(-2),
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_200,
        statsRequired: {
          stamina: 20,
        },
        statsSelf: {
          stamina: -20,
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
        statsItem: {
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
        statsEnemy: {
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
      },
      {
        type: 'interval',
        cooldown: 4_000,
        statsEnemy: {
          lifeSteal: -10,
        },
        chancePercent: 30,
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
    tags: ['weapon'],
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
          thorns: 1,
        },
      },
    ],
  },
  {
    name: 'thornBow',
    prompt: 'a bow and arrow made out of thorny wood',
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
            valueAddingStats: ['thorns'],
            description: '**+0.2** *damage* per *thorns*',
            valueMultiplier: 0.2,
          },
        ],
      },
      {
        type: 'onAttackAfterHit',
        statsSelf: {
          thorns: 1,
        },
        chancePercent: 50,
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
          luck: 5,
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
      },
      {
        type: 'onAttackAfterHit',
        statsEnemy: {
          poison: 1,
          randomDebuff: 1,
        },
        chancePercent: 70,
      },
    ],
  },
  {
    name: 'leatherArmor',
    prompt: 'a leather armor on an armor stand',
    tags: ['accessory'],
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
        statsRequired: {
          luck: 4,
        },
        statsSelf: {
          empower: 1,
        },
        chancePercent: 50,
      },
      {
        type: 'interval',
        cooldown: 3_000,
        statsSelf: {
          randomDebuff: -1,
        },
      },
    ],
  },
  {
    name: 'heartyDurian',
    prompt: 'a big ripe hearty durian fruit',
    tags: ['food'],
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
    tags: ['weapon'],
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
          },
        ],
      },
    ],
  },
  {
    name: 'piggyBank',
    prompt: 'a bright pink piggy bank',
    tags: ['accessory'],
    rarity: 'common',
    price: 3,
    shop: true,
    disabled: !NEXT_PHASE,
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
    ],
  },
  {
    name: 'mixer',
    prompt: 'a food mixer',
    tags: ['accessory'],
    rarity: 'rare',
    price: 5,
    shop: true,
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
          },
        ],
      },
    ],
  },
  {
    name: 'metalGloves',
    prompt: 'a pair of metal gloves',
    tags: ['accessory'],
    rarity: 'rare',
    price: 4,
    shop: true,
    disabled: !NEXT_PHASE,
    stats: {
      space: space(-3),
    },
    triggers: [
      {
        type: 'startOfBattle',
        statsSelf: {
          empower: 1,
          haste: 15,
        },
      },
    ],
  },
  {
    name: 'longSword',
    prompt: 'a long sword with a shiny metal blade',
    tags: ['weapon'],
    rarity: 'epic',
    price: 3 + 4 + 4,
    shop: false,
    disabled: !NEXT_PHASE,
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
          empower: 2,
          haste: 25,
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
    disabled: !NEXT_PHASE,
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
    disabled: !NEXT_PHASE,
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
          stamina: 30,
        },
        statsSelf: {
          stamina: -30,
        },
        attack: {
          damage: 18,
          accuracy: 75,
        },
      },
      {
        type: 'onAttackBeforeHit',
        statsEnemy: {
          block: -28,
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
    disabled: !NEXT_PHASE,
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
          stamina: 5,
        },
        attack: {
          damage: 1,
          accuracy: 75,
        },
      },
      {
        type: 'onAttackBeforeHit',
        statsEnemy: {
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
        statsEnemy: {
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
    triggers: [
      {
        type: 'startOfBattle',
        modifiers: [
          {
            arithmetic: 'add',
            sourceSide: 'enemy',
            targetStats: 'statsEnemy',
            targetStat: 'poison',
            description: 'Apply **1** *poison* for every *food* the enemy has',
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
    disabled: !NEXT_PHASE,
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
    disabled: !NEXT_PHASE,
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
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        modifiers: [
          {
            arithmetic: 'add',
            targetStats: 'statsSelf',
            targetStat: 'mana',
            description: 'Generate **1** *mana* for every *crystal*',
            valueAddingTags: ['crystal'],
            valueMultiplier: 1,
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
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          mana: 3,
        },
        statsSelf: {
          flying: 3,
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
    triggers: [
      {
        type: 'interval',
        cooldown: 3_000,
        statsRequired: {
          mana: 3,
        },
        statsSelf: {
          mana: -3,
          barrier: 3,
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
    disabled: !NEXT_PHASE,
    statsItem: {
      unblockable: 1,
      critChance: 30,
    },
    triggers: [
      {
        type: 'interval',
        cooldown: 2_000,
        attack: {
          damage: 6,
          accuracy: 85,
        },
      },
      {
        type: 'onAttackCritAfterHit',
        statsItem: {
          critChance: 10,
        },
        statsSelf: {
          mana: 2,
        },
      },
    ],
  },
] as const satisfies ItemDefinition[]

export const allItemNames = constArrayMap(allItemsConst, 'name')
export const ItemName = z.enum(allItemNames)
export type ItemName = z.infer<typeof ItemName>

const allItems: ItemDefinition[] = allItemsConst.filter(
  (i: ItemDefinition) => !i.disabled,
)

export const getAllItems = async () => allItems

const itemByName = keyBy(allItems, (i) => i.name)

export const tryGetItemByName = async (name: string) => {
  const item = itemByName[name]
  return item
}

export const getItemByName = async (name: string) => {
  const item = await tryGetItemByName(name)
  if (!item) {
    // throw new Error(`Item not found: ${name}`)
    // console.warn(`Item not found: ${name}`)
    return {
      name,
      tags: [],
      price: 0,
      shop: false,
    }
  }
  return item
}
