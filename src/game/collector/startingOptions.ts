import { CollectorStarterId } from '@/contracts/collector-api'
import { ItemData } from '@/game/ItemData'
import { createId } from '@paralleldrive/cuid2'

export type CollectorStartingOption = {
  id: CollectorStarterId
  name: string
  description: string
  previewItems: ItemData[]
}

export const collectorStartingOptions: CollectorStartingOption[] = [
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    description: 'A blacksmith that can forge items.',
    previewItems: [
      { name: 'hero' },
      { name: 'blacksmith' },
      { name: 'woodenSword', aspects: [], rarity: 'common' },
      { name: 'woodenBuckler', aspects: [], rarity: 'common' },
    ],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'A hunter skilled with bow and arrow.',
    previewItems: [
      { name: 'hero' },
      { name: 'hunter' },
      { name: 'shortBow', aspects: [], rarity: 'common' },
      { name: 'roseBush', aspects: [], rarity: 'common' },
    ],
  },
  {
    id: 'farmer',
    name: 'Farmer',
    description: 'A humble farmer who cultivates magical plants and mushrooms.',
    previewItems: [
      { name: 'hero' },
      { name: 'farmer' },
      { name: 'chiliPepper', aspects: [], rarity: 'common' },
      { name: 'flyAgaric', aspects: [], rarity: 'common' },
    ],
  },
]

export const createCollectorStartingItems = (
  starterId: CollectorStarterId,
  now = new Date().toISOString(),
) => {
  const option = collectorStartingOptions.find(
    (candidate) => candidate.id === starterId,
  )
  if (!option) throw new Error(`Unknown collector starter: ${starterId}`)

  return option.previewItems.map((item, index) =>
    index < 2
      ? { ...item }
      : {
          ...item,
          id: createId(),
          createdAt: now,
        },
  )
}
