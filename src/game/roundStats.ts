import { sumBy } from 'lodash-es'
import { RarityWeights } from './rarities'

type RoundStats = {
  roundNo: number
  gold: number
  // health: number
  experience: number
  rarityWeights: RarityWeights
}

const defaultRarityWeights: RarityWeights = {
  common: 10,
  uncommon: 5,
  rare: 3,
  epic: 2,
  legendary: 1,
}

export const roundStats: RoundStats[] = [
  {
    roundNo: 0,
    gold: 12,
    // health: 50,
    experience: 0,
    rarityWeights: {
      common: 1,
    },
  },
  {
    roundNo: 1,
    gold: 9,
    // health: 70,
    experience: 1,
    rarityWeights: {
      common: 2,
      uncommon: 1,
    },
  },
  {
    roundNo: 2,
    gold: 9,
    // health: 90,
    experience: 1,
    rarityWeights: {
      common: 1,
      uncommon: 1,
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
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 6,
    gold: 11,
    // health: 200,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 7,
    gold: 11, // Sub-class thingy gives another 10 gold
    // health: 230,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 8,
    gold: 12,
    // health: 260,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
    },
  },
  {
    roundNo: 9,
    gold: 12,
    // health: 300,
    experience: 2,
    rarityWeights: {
      ...defaultRarityWeights,
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

export const getRoundStatsCumulative = (roundNo: number) => {
  const rounds = roundStats.filter((r) => r.roundNo <= roundNo)
  return {
    gold: sumBy(rounds, (r) => r.gold),
    // health: sumBy(rounds, (r) => r.health),
    experience: sumBy(rounds, (r) => r.experience),
  }
}
