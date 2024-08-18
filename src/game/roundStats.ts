import { Stats } from './stats'
type RoundStats = Stats & { roundNo: number }

export const roundStats: RoundStats[] = [
  {
    roundNo: 0,
    gold: 12,
    health: 50,
  },
  {
    roundNo: 1,
    gold: 9,
    health: 70,
  },
  {
    roundNo: 2,
    gold: 9,
    health: 90,
  },
  {
    roundNo: 3,
    gold: 9,
    health: 110,
  },
  {
    roundNo: 4,
    gold: 10,
    health: 140,
  },
  {
    roundNo: 5,
    gold: 10,
    health: 170,
  },
  {
    roundNo: 6,
    gold: 11,
    health: 200,
  },
  {
    roundNo: 7,
    gold: 11, // Sub-class thingy gives another 10 gold
    health: 230,
  },
  {
    roundNo: 8,
    gold: 12,
    health: 260,
  },
  {
    roundNo: 9,
    gold: 12,
    health: 300,
  },
  {
    roundNo: 10,
    gold: 13,
    health: 340,
  },
  {
    roundNo: 11,
    gold: 13,
    health: 380,
  },
  {
    roundNo: 12,
    gold: 14,
    health: 420,
  },
  {
    roundNo: 13,
    gold: 14,
    health: 460,
  },
  {
    roundNo: 14,
    gold: 15,
    health: 520,
  },
  {
    roundNo: 15,
    gold: 15,
    health: 580,
  },
  {
    roundNo: 16,
    gold: 15,
    health: 640,
  },
  {
    roundNo: 17,
    gold: 15,
    health: 700,
  },
]
