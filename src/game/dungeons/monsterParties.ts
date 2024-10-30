import { ItemData } from '@/components/game/ItemData'

export const allMonsterParties: {
  name: string
  minLevel: number
  itemsHero: ItemData[]
  itemsBase: ItemData[]
  itemsAdded: ItemData[]
}[] = [
  {
    name: 'dudeWithSword',
    minLevel: 1,
    itemsHero: [{ name: 'hero' }],
    itemsBase: [{ name: 'woodenSword' }],
    itemsAdded: [
      { name: 'woodenSword' },
      { name: 'woodenBuckler' },
      { name: 'banana' },
      { name: 'energyDrink' },
    ],
  },
  {
    name: 'dudeWithDagger',
    minLevel: 2,
    itemsHero: [{ name: 'hero' }],
    itemsBase: [{ name: 'dagger' }],
    itemsAdded: [
      { name: 'dagger' },
      { name: 'spyglass' },
      { name: 'whetstone' },
      { name: 'banana' },
      { name: 'energyDrink' },
      { name: 'luckyClover' },
    ],
  },
]
