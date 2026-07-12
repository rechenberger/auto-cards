import { sum } from 'lodash-es'
import { getItemByName } from './allItems'
import { DEFAULT_GAME_VERSION, GameVersion } from './gameVersion'
import { LoadoutData } from './LoadoutData'

export const calcLoadoutPrice = (
  loadout: LoadoutData,
  gameVersion: GameVersion = DEFAULT_GAME_VERSION,
) => {
  const prices = loadout.items.map((item) => {
    const def = getItemByName(item.name, gameVersion)
    return def.price * (item.count ?? 1)
  })
  return sum(prices)
}
