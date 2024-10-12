import { sumBy } from 'lodash-es'
import { NO_OF_ROUNDS } from './config'
import { RarityWeights } from './rarities'
import { Tag } from './tags'

type RoundStats = {
  roundNo: number
  gold: number
  // health: number
  experience: number
  rarityWeights: RarityWeights
  specialBuyRound?: {
    tag: Tag
    noOfItems: number
  }
}

const defaultRarityWeights: RarityWeights = {
  common: 10,
  uncommon: 5,
  rare: 3,
  epic: 2,
  legendary: 1,
}

const allRoundStats: RoundStats[] = [
  {
    roundNo: 0,
    gold: 12,
    // health: 50,
    experience: 0,
    rarityWeights: {
      common: 95,
      uncommon: 4,
      rare: 1,
    },
    // specialBuyRound: {
    //   tag: 'class',
    //   noOfItems: 3,
    // },
  },
  {
    roundNo: 1,
    gold: 9,
    // health: 70,
    experience: 1,
    rarityWeights: {
      common: 70,
      uncommon: 25,
      rare: 5,
    },
  },
  {
    roundNo: 2,
    gold: 9,
    // health: 90,
    experience: 1,
    rarityWeights: {
      common: 50,
      uncommon: 40,
      rare: 10,
    },
  },
  {
    roundNo: 3,
    gold: 9,
    // health: 110,
    experience: 1,
    rarityWeights: {
      common: 40,
      uncommon: 40,
      rare: 20,
    },
  },
  {
    roundNo: 4,
    gold: 10,
    // health: 140,
    experience: 1,
    rarityWeights: {
      common: 30,
      uncommon: 40,
      rare: 30,
    },
  },
  {
    roundNo: 5,
    gold: 10,
    // health: 170,
    experience: 2,
    rarityWeights: {
      common: 25,
      uncommon: 39,
      rare: 35,
      epic: 1,
    },
  },
  {
    roundNo: 6,
    gold: 11,
    // health: 200,
    experience: 2,
    rarityWeights: {
      common: 25,
      uncommon: 35,
      rare: 35,
      epic: 5,
    },
  },
  {
    roundNo: 7,
    gold: 11, // Sub-class thingy gives another 10 gold
    // health: 230,
    experience: 2,
    rarityWeights: {
      common: 25,
      uncommon: 30,
      rare: 35,
      epic: 10,
    },
  },
  {
    roundNo: 8,
    gold: 12,
    // health: 260,
    experience: 2,
    rarityWeights: {
      common: 25,
      uncommon: 25,
      rare: 30,
      epic: 20,
    },
  },
  {
    roundNo: 9,
    gold: 12,
    // health: 300,
    experience: 2,
    rarityWeights: {
      common: 20,
      uncommon: 25,
      rare: 30,
      epic: 25,
    },
  },
  {
    roundNo: 10,
    gold: 13,
    // health: 340,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 11,
    gold: 13,
    // health: 380,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 12,
    gold: 14,
    // health: 420,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 13,
    gold: 14,
    // health: 460,
    experience: 3,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 14,
    gold: 15,
    // health: 520,
    experience: 3,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 15,
    gold: 15,
    // health: 580,
    experience: 3,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 16,
    gold: 15,
    // health: 640,
    experience: 3,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 17,
    gold: 15,
    // health: 700,
    experience: 3,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
]

export const roundStats = allRoundStats.filter((r) => r.roundNo <= NO_OF_ROUNDS)

export const getRoundStatsCumulative = (roundNo: number) => {
  const rounds = allRoundStats.filter((r) => r.roundNo <= roundNo)
  return {
    gold: sumBy(rounds, (r) => r.gold),
    // health: sumBy(rounds, (r) => r.health),
    experience: sumBy(rounds, (r) => r.experience),
  }
}
