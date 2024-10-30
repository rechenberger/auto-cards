import { createId } from '@paralleldrive/cuid2'
import { ItemData } from '../ItemData'

export type CollectorStartingOption = {
  name: string
  description: string
  items: () => ItemData[]
}

export const collectorStartingOptions: CollectorStartingOption[] = [
  {
    name: 'Blacksmith',
    description: 'A blacksmith that can forge items.',
    items: () => [
      {
        name: 'hero',
      },
      {
        name: 'blacksmith',
      },
      {
        id: createId(),
        name: 'woodenSword',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
      {
        id: createId(),
        name: 'woodenBuckler',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'Hunter',
    description: 'A hunter skilled with bow and arrow.',
    items: () => [
      {
        name: 'hero',
      },
      {
        name: 'hunter',
      },
      {
        id: createId(),
        name: 'shortBow',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
      {
        id: createId(),
        name: 'roseBush',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    name: 'Farmer',
    description: 'A humble farmer who cultivates magical plants and mushrooms.',
    items: () => [
      {
        name: 'hero',
      },
      {
        name: 'farmer',
      },
      {
        id: createId(),
        name: 'chiliPepper',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
      {
        id: createId(),
        name: 'flyAgaric',
        aspects: [],
        rarity: 'common',
        createdAt: new Date().toISOString(),
      },
    ],
  },
]
