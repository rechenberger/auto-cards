import { Stats } from './stats'
type RoundStats = Stats & { round: number }

export const roundStats: RoundStats[] = [
  {
    round: 0,
    gold: 12,
    health: 50,
  },
  {
    round: 1,
    gold: 9,
    health: 70,
  },
  {
    round: 2,
    gold: 9,
    health: 90,
  },
  {
    round: 3,
    gold: 9,
    health: 110,
  },
  {
    round: 4,
    gold: 10,
    health: 140,
  },
  {
    round: 5,
    gold: 10,
    health: 170,
  },
  {
    round: 6,
    gold: 11,
    health: 200,
  },
  {
    round: 7,
    gold: 11, // Sub-class thingy gives another 10 gold
    health: 230,
  },
  {
    round: 8,
    gold: 12,
    health: 260,
  },
  {
    round: 9,
    gold: 12,
    health: 300,
  },
  {
    round: 10,
    gold: 13,
    health: 340,
  },
  {
    round: 11,
    gold: 13,
    health: 380,
  },
  {
    round: 12,
    gold: 14,
    health: 420,
  },
  {
    round: 13,
    gold: 14,
    health: 460,
  },
  {
    round: 14,
    gold: 15,
    health: 520,
  },
  {
    round: 15,
    gold: 15,
    health: 580,
  },
  {
    round: 16,
    gold: 15,
    health: 640,
  },
  {
    round: 17,
    gold: 15,
    health: 700,
  },
]
