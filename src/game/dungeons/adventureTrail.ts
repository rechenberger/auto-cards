import { ItemData } from '@/components/game/ItemData'
import { generateCollectorItemAspects } from '@/components/game/collector/generateCollectorItemAspects'
import { generateCollectorItemByRarityWeight } from '@/components/game/collector/generateCollectorItemByRarityWeight'
import { promiseSeqMap } from '@/lib/promiseSeqMap'
import assert from 'assert'
import { range } from 'lodash-es'
import { AspectName } from '../aspects'
import { COLLECTOR_UPGRADE_SCALING_MULTIPLIER } from '../config'
import { randomRarityByWeight } from '../randomRarityByWeight'
import { rngFloat, rngGenerator, rngItem } from '../seed'
import { DungeonDefinition, DungeonRoom } from './DungeonDefinition'
import { allMonsterParties } from './monsterParties'

const scaleByLevel = ({
  minLevel,
  maxLevel,
  level,
}: {
  minLevel: number
  maxLevel: number
  level: number
}) => {
  if (level < minLevel) return 0
  if (level >= maxLevel) return 1
  // Add 1 to both numerator and denominator to start scaling from minLevel
  // Example: if minLevel=5, maxLevel=10:
  // At level 5: (5-5+1)/(10-5+1) = 1/6 (scaling starts)
  // At level 6: (6-5+1)/(10-5+1) = 2/6
  // At level 10: (10-5+1)/(10-5+1) = 6/6 = 1
  return (level - minLevel + 1) / (maxLevel - minLevel + 1)
}

export const adventureTrail: DungeonDefinition = {
  name: 'adventureTrail',
  description:
    'An infinitely repeatable trail of adventure that leads to the greatest of treasures.',
  levelMax: 100,
  rewards: ({ level }) => ({
    rarityWeights: {
      common: 1,
      uncommon: scaleByLevel({ minLevel: 2, maxLevel: 20, level }),
      rare: scaleByLevel({ minLevel: 20, maxLevel: 40, level }),
      epic: scaleByLevel({ minLevel: 40, maxLevel: 60, level }),
      legendary: scaleByLevel({ minLevel: 60, maxLevel: 80, level }),
    },
  }),
  generate: async ({ game, seed: _seed, level, rewards }) => {
    const seed = rngGenerator({ seed: _seed })

    const giveAspect = ({
      item,
      aspect,
      multiplier,
    }: {
      item: ItemData
      aspect: AspectName
      multiplier?: number
    }) => {
      const rnd = rngFloat({
        seed,
      })
      return {
        ...item,
        aspects: [...(item.aspects ?? []), { name: aspect, rnd, multiplier }],
      } satisfies ItemData
    }

    let monsterParties = allMonsterParties
    monsterParties = monsterParties.filter((party) => party.minLevel <= level)

    const noOfFights = Math.ceil((level + 1) / 10)

    const fightRooms: DungeonRoom[] = await promiseSeqMap(
      range(noOfFights),
      async () => {
        const monsterParty = rngItem({
          seed,
          items: monsterParties,
        })
        assert(monsterParty, 'No monster party found')

        const heroAspectMinLevel = 2
        let heros = monsterParty.itemsHero

        if (level >= heroAspectMinLevel) {
          heros = monsterParty.itemsHero.map((item) =>
            giveAspect({
              item,
              aspect: 'heroPower',
              multiplier:
                COLLECTOR_UPGRADE_SCALING_MULTIPLIER **
                (level - 1 - heroAspectMinLevel),
            }),
          )
        }

        const maxNoOfAddedItems = 20
        const noOfAddedItems = Math.min(
          level - monsterParty.minLevel,
          maxNoOfAddedItems,
        )
        let itemsWithAspects = [
          ...monsterParty.itemsBase,
          ...range(noOfAddedItems).map(() => {
            return rngItem({
              seed,
              items: monsterParty.itemsAdded,
            })
          }),
        ]

        const maxLevelForCommon = 9
        itemsWithAspects = await promiseSeqMap(
          itemsWithAspects,
          async (item) => {
            const rarity = randomRarityByWeight({
              rarityWeights: {
                ...rewards.rarityWeights,
                common:
                  level > maxLevelForCommon ? 0 : rewards.rarityWeights.common,
              },
              seed,
            })

            const itemData = await generateCollectorItemAspects({
              item,
              seed,
              rarity,
              // multiplier: COLLECTOR_UPGRADE_SCALING_MULTIPLIER ** level,
            })

            return itemData
          },
        )

        const items: ItemData[] = [...heros, ...itemsWithAspects]

        const fightRoom: DungeonRoom = {
          type: 'fight',
          loadout: {
            items,
          },
        }

        return fightRoom
      },
    )

    const reward = await generateCollectorItemByRarityWeight({
      game,
      seed,
      rarityWeights: rewards.rarityWeights,
    })

    const rewardRoom: DungeonRoom = {
      type: 'reward',
      items: [reward],
    }

    const rooms: DungeonRoom[] = [...fightRooms, rewardRoom]
    return {
      rooms,
    }
  },
}
