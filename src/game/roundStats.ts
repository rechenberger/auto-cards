import { sumBy } from 'lodash-es'
import { RarityWeights } from './rarities'

type RoundStats = {
  roundNo: number
  gold: number
  health: number
  experience: number
  rarityWeights: RarityWeights
}

const rarityWeights: RarityWeights = {
  common: 1,
}

export const roundStats: RoundStats[] = [
  {
    roundNo: 0,
    gold: 12,
    health: 50,
    experience: 0,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 1,
    gold: 9,
    health: 70,
    experience: 1,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 2,
    gold: 9,
    health: 90,
    experience: 1,
    rarityWeights: {
      ...rarityWeights,
      uncommon: 1,
    },
  },
  {
    roundNo: 3,
    gold: 9,
    health: 110,
    experience: 1,
    rarityWeights: {
      ...rarityWeights,
      uncommon: 1,
    },
  },
  {
    roundNo: 4,
    gold: 10,
    health: 140,
    experience: 1,
    rarityWeights: {
      ...rarityWeights,
      uncommon: 1,
      rare: 1,
    },
  },
  {
    roundNo: 5,
    gold: 10,
    health: 170,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 6,
    gold: 11,
    health: 200,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 7,
    gold: 11, // Sub-class thingy gives another 10 gold
    health: 230,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 8,
    gold: 12,
    health: 260,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 9,
    gold: 12,
    health: 300,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 10,
    gold: 13,
    health: 340,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 11,
    gold: 13,
    health: 380,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 12,
    gold: 14,
    health: 420,
    experience: 2,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 13,
    gold: 14,
    health: 460,
    experience: 3,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 14,
    gold: 15,
    health: 520,
    experience: 3,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 15,
    gold: 15,
    health: 580,
    experience: 3,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 16,
    gold: 15,
    health: 640,
    experience: 3,
    rarityWeights: {
      ...rarityWeights,
    },
  },
  {
    roundNo: 17,
    gold: 15,
    health: 700,
    experience: 3,
    rarityWeights: {
      ...rarityWeights,
    },
  },
]

export const getRoundStatsCumulative = (roundNo: number) => {
  const rounds = roundStats.filter((r) => r.roundNo <= roundNo)
  return {
    gold: sumBy(rounds, (r) => r.gold),
    health: sumBy(rounds, (r) => r.health),
    experience: sumBy(rounds, (r) => r.experience),
  }
}
