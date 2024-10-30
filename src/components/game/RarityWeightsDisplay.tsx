import { allRarityDefinitions, RarityWeights } from '@/game/rarities'
import { cn } from '@/lib/utils'
import { capitalCase } from 'change-case'
import { isNil, mapValues, omitBy, sum, values } from 'lodash-es'
import { Fragment } from 'react'

export const RarityWeightsDisplay = ({
  rarityWeights: _rarityWeights,
}: {
  rarityWeights: RarityWeights
}) => {
  const rarityWeights = omitBy(_rarityWeights, isNil)
  const weightSum = sum(values(rarityWeights))
  const rarityChances = mapValues(rarityWeights, (weight) => weight / weightSum)

  return (
    <>
      {allRarityDefinitions.map((rarity) => (
        <Fragment key={rarity.name}>
          <div className={cn('flex flex-row gap-4', rarity.textClass)}>
            <div className="flex-1">{capitalCase(rarity.name)}</div>
            <div className="text-right">
              {Math.round(100 * rarityChances[rarity.name] || 0)}%
            </div>
          </div>
        </Fragment>
      ))}
    </>
  )
}
