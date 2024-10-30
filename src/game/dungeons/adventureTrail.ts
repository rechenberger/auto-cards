import { generateCollectorItemAspects } from '@/components/game/collector/generateCollectorItemAspects'
import { generateCollectorItemByRarityWeight } from '@/components/game/collector/generateCollectorItemByRarityWeight'
import { ItemData } from '@/components/game/ItemData'
import { promiseSeqMap } from '@/lib/promiseSeqMap'
import assert from 'assert'
import { range } from 'lodash-es'
import { randomRarityByWeight } from '../randomRarityByWeight'
import { rngGenerator, rngItem } from '../seed'
import { DungeonDefinition, DungeonRoom } from './DungeonDefinition'
import { allMonsterParties } from './monsterParties'

export const adventureTrail: DungeonDefinition = {
  name: 'adventureTrail',
  description:
    'An infinitely repeatable trail of adventure that leads to the greatest of treasures.',
  levelMax: 100,
  generate: async ({ game, seed: _seed, level }) => {
    const seed = rngGenerator({ seed: _seed })

    // const giveMonsterPower = (monster: ItemData) => {
    //   const rnd = rngFloat({
    //     seed,
    //   })
    //   return {
    //     ...monster,
    //     aspects: [
    //       ...(monster.aspects ?? []),
    //       { name: 'monsterPower', rnd, multiplier: 1.2 ** level },
    //     ],
    //   } satisfies ItemData
    // }

    let monsterParties = allMonsterParties
    monsterParties = monsterParties.filter((party) => party.minLevel <= level)
    const monsterParty = rngItem({
      seed,
      items: monsterParties,
    })
    assert(monsterParty, 'No monster party found')

    const noOfAddedItems = monsterParty.minLevel - level
    let itemsWithAspects = [
      ...monsterParty.itemsBase,
      ...range(noOfAddedItems).map(() => {
        return rngItem({
          seed,
          items: monsterParty.itemsAdded,
        })
      }),
    ]
    itemsWithAspects = await promiseSeqMap(itemsWithAspects, (item) => {
      const rarity = randomRarityByWeight({
        rarityWeights: {
          common: 1,
          uncommon: 0.5,
        },
        seed,
      })

      return generateCollectorItemAspects({
        item: item,
        seed,
        rarity,
        // multiplier: 1.2 ** level,
      })
    })

    const items: ItemData[] = [...monsterParty.itemsHero, ...itemsWithAspects]

    const fightRoom: DungeonRoom = {
      type: 'fight',
      loadout: {
        items,
      },
    }

    const reward = await generateCollectorItemByRarityWeight({
      game,
      seed,
      rarityWeights: {
        common: 1,
        uncommon: 0.5,
      },
    })

    const rewardRoom: DungeonRoom = {
      type: 'reward',
      items: [reward],
    }

    const rooms: DungeonRoom[] = [fightRoom, rewardRoom]
    return {
      rooms,
    }
  },
}
