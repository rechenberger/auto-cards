import { LoadoutData } from '@/db/schema-zod'
import { rngFloat, rngOrder, SeedArray } from '@/game/seed'
import { cloneDeep, minBy, orderBy, range } from 'lodash-es'
import { getItemByName } from './allItems'
import { calcCooldown } from './calcCooldown'
import {
  addStats,
  calcStats,
  hasStats,
  sumStats2,
  tryAddStats,
} from './calcStats'
import {
  BASE_TICK_TIME,
  CRIT_MULTIPLIER,
  FATIGUE_STARTS_AT,
  MAX_MATCH_TIME,
  MAX_THORNS_MULTIPLIER,
} from './config'
import { orderItems } from './orderItems'
import { Stats } from './stats'

export type MatchLog = {
  logIdx: number
  time: number
  msg?: string
  sideIdx: number
  itemIdx?: number
  itemName?: string
  triggerIdx?: number
  stats?: Stats
  targetSideIdx?: number
  targetItemIdx?: number
  stateSnapshot: MatchState
}

export type MatchReport = Awaited<ReturnType<typeof generateMatch>>

type GenerateMatchInput = {
  participants: {
    loadout: LoadoutData
  }[]
  seed: SeedArray
  skipLogs?: boolean
}

export const generateMatchState = async (input: GenerateMatchInput) => {
  const sides = await Promise.all(
    input.participants.map(async (p, idx) => {
      let items = await Promise.all(
        p.loadout.items.map(async (i) => {
          const def = await getItemByName(i.name)
          return {
            ...def,
            statsItem: def.statsItem ? { ...def.statsItem } : undefined,
            count: i.count ?? 1,
          }
        }),
      )
      items = await orderItems(items)
      const stats = await calcStats({ loadout: p.loadout })

      return {
        items,
        stats,
        sideIdx: idx,
      }
    }),
  )

  const futureActions = [
    { type: 'baseTick' as const, time: 0 },
    ...rngOrder({
      items: sides,
      seed: [...input.seed, 'futureActions'],
    }).flatMap((side) => {
      return side.items.flatMap((item, itemIdx) => {
        return (
          item.triggers?.flatMap((trigger, triggerIdx) => {
            if (!['interval', 'startOfBattle'].includes(trigger.type)) return []
            const cooldown = calcCooldown({
              cooldown: trigger.cooldown,
              stats: side.stats,
              tags: item.tags ?? [],
            })
            return range(item.count ?? 1).map((itemCounter) => ({
              type: 'itemTrigger' as const,
              time: trigger.type === 'startOfBattle' ? 0 : cooldown,
              lastUsed: 0,
              sideIdx: side.sideIdx,
              itemIdx,
              triggerIdx,
              itemCounter, // to have different seed for each item in a stack
            }))
          }) || []
        )
      })
    }),
  ]
  return { sides, futureActions }
}
export type MatchState = Awaited<ReturnType<typeof generateMatchState>>

export const generateMatch = async ({
  skipLogs,
  participants,
  seed,
}: GenerateMatchInput) => {
  let time = 0

  const state = await generateMatchState({ participants, seed })
  const { sides, futureActions } = state

  const logs: MatchLog[] = []
  const log = (
    log: Omit<MatchLog, 'time' | 'itemName' | 'stateSnapshot' | 'logIdx'>,
  ) => {
    if (skipLogs) return
    const itemName =
      log.itemIdx !== undefined
        ? sides[log.sideIdx].items[log.itemIdx].name
        : undefined
    const stateSnapshot = cloneDeep(state)
    logs.push({ ...log, time, itemName, stateSnapshot, logIdx: logs.length })
  }

  const endOfMatch = () => {
    const sidesRandom = rngOrder({ items: sides, seed: [...seed, 'end'] })
    const sidesByHealth = orderBy(
      sidesRandom,
      (s) => s.stats.health ?? 0,
      'asc',
    )
    const [loser, winner] = sidesByHealth
    log({ msg: 'Game over', sideIdx: loser.sideIdx })
    log({ msg: 'Loses', sideIdx: loser.sideIdx })
    log({ msg: 'Wins!', sideIdx: winner.sideIdx })
    return { logs, winner, loser, time }
  }

  while (true) {
    const seedTick = [...seed, time]

    const nextTime = minBy(futureActions, (a) => a.time)?.time
    if (nextTime === undefined) {
      throw new Error('no next time')
    }

    // GOTO FUTURE
    time = nextTime

    for (const action of futureActions) {
      if (action.time !== time) continue

      if (action.type === 'baseTick') {
        action.time += BASE_TICK_TIME
        for (const side of rngOrder({
          items: sides,
          seed: [...seedTick, 'actions'],
        })) {
          // REGEN
          const missingHealth =
            (side.stats.healthMax ?? 0) - (side.stats.health ?? 0)
          const missingStamina =
            (side.stats.staminaMax ?? 0) - (side.stats.stamina ?? 0)
          const regenStats = {
            health: Math.min(missingHealth, side.stats.regen ?? 0),
            stamina: Math.min(missingStamina, side.stats.staminaRegen ?? 0),
          }
          if (regenStats.health > 0 || regenStats.stamina > 0) {
            addStats(side.stats, regenStats)
            log({
              msg: 'Regenerate',
              sideIdx: side.sideIdx,
              stats: regenStats,
              targetSideIdx: side.sideIdx,
            })
          }

          // POISON
          if (side.stats.poison) {
            const poisonStats = {
              health: -1 * side.stats.poison ?? 0,
            }
            addStats(side.stats, poisonStats)
            log({
              msg: 'Poison',
              sideIdx: side.sideIdx,
              stats: poisonStats,
              targetSideIdx: side.sideIdx,
            })
          }

          // FLYING
          if (side.stats.flying) {
            const flyingStats = {
              flying: -1,
            }
            addStats(side.stats, flyingStats)
            log({
              msg: 'Flying',
              sideIdx: side.sideIdx,
              stats: flyingStats,
              targetSideIdx: side.sideIdx,
            })
          }

          // FATIGUE
          const fatigue = Math.max(
            1 + (time - FATIGUE_STARTS_AT) / BASE_TICK_TIME,
            0,
          )
          if (fatigue > 0) {
            const fatigueStats = {
              health: -1 * fatigue,
            }
            addStats(side.stats, fatigueStats)
            log({
              msg: 'Fatigue',
              sideIdx: side.sideIdx,
              stats: fatigueStats,
              targetSideIdx: side.sideIdx,
            })
          }
        }
      } else if (action.type === 'itemTrigger') {
        const seedAction = [...seedTick, action]
        const mySide = sides[action.sideIdx]
        const otherSide = sides[1 - action.sideIdx] // lol
        const item = mySide.items[action.itemIdx]
        const trigger = item.triggers![action.triggerIdx]
        action.lastUsed = time

        const statsForItem = item.statsItem
          ? sumStats2(mySide.stats, item.statsItem)
          : mySide.stats

        const { statsRequired, statsSelf, statsEnemy, attack } = trigger
        let hasRequiredStats = true
        if (statsRequired) {
          const enough = hasStats(statsForItem, statsRequired)
          if (!enough) {
            log({
              ...action,
              msg: `Not enough`,
              targetSideIdx: mySide.sideIdx,
              stats: statsRequired,
            })
            hasRequiredStats = false
          }
        }
        if (hasRequiredStats) {
          if (statsSelf) {
            tryAddStats(mySide.stats, statsSelf)
            log({
              ...action,
              stats: statsSelf,
              targetSideIdx: mySide.sideIdx,
            })
          }
          if (trigger.statsItem) {
            if (!item.statsItem) {
              item.statsItem = {}
            }
            tryAddStats(item.statsItem, trigger.statsItem)
            log({
              ...action,
              msg: 'apply to item',
              stats: trigger.statsItem,
              targetSideIdx: mySide.sideIdx,
              targetItemIdx: action.itemIdx,
            })
          }
          const tryingToReach = !!statsEnemy || !!attack
          if (tryingToReach) {
            const canReachEnemy = otherSide.stats.flying
              ? !!statsForItem.flying || !!statsForItem.ranged
              : true
            if (!canReachEnemy) {
              log({
                ...action,
                targetSideIdx: otherSide.sideIdx,
                msg: 'Cannot Reach',
              })
            } else {
              if (statsEnemy) {
                tryAddStats(otherSide.stats, statsEnemy)
                log({
                  ...action,
                  stats: statsEnemy,
                  targetSideIdx: otherSide.sideIdx,
                })
              }
              if (attack) {
                const accuracyRng = rngFloat({
                  seed: [...seedAction, 'hit'],
                  max: 100,
                })
                let accuracy = attack.accuracy ?? 0
                if (statsForItem.blind) {
                  accuracy -= statsForItem.blind
                }
                if (statsForItem.drunk) {
                  accuracy -= statsForItem.drunk
                }
                if (statsForItem.luck) {
                  accuracy += statsForItem.luck
                }
                const doesHit = accuracyRng <= accuracy
                if (doesHit) {
                  let damage = attack.damage ?? 0

                  if (otherSide.stats.drunk) {
                    damage *= 1 + otherSide.stats.drunk / 100
                  }

                  const critChance = statsForItem.aim ?? 0
                  const doesCrit =
                    rngFloat({ seed: [...seedAction, 'crit'], max: 100 }) <=
                    critChance
                  if (doesCrit) {
                    damage *= CRIT_MULTIPLIER
                    if (statsEnemy?.critDamage) {
                      damage *= 1 + statsEnemy.critDamage / 100
                    }
                  }
                  damage = Math.round(damage)

                  const blockedDamage = Math.min(
                    damage,
                    otherSide.stats.block ?? 0,
                  )
                  damage -= blockedDamage
                  const targetStats: Stats = {
                    health: -1 * damage,
                    block: -1 * blockedDamage,
                  }
                  addStats(otherSide.stats, targetStats)
                  log({
                    ...action,
                    msg: doesCrit ? `Critical Hit` : `Hit`,
                    targetSideIdx: otherSide.sideIdx,
                    stats: targetStats,
                  })
                  if (doesCrit) {
                    if (statsForItem.aim) {
                      const removeAimStats: Stats = {
                        aim: -1 * statsForItem.aim,
                      }
                      tryAddStats(mySide.stats, removeAimStats)
                      if (item.statsItem) {
                        tryAddStats(item.statsItem, removeAimStats)
                      }
                      log({
                        ...action,
                        msg: `Reset Aim`,
                        targetSideIdx: mySide.sideIdx,
                        stats: removeAimStats,
                      })
                    }
                  }

                  // LIFESTEAL
                  if (statsForItem.lifeSteal && damage > 0) {
                    const lifeStealDamage = Math.ceil(
                      damage * (statsForItem.lifeSteal / 100),
                    )
                    const lifeStealStats: Stats = {
                      health: lifeStealDamage,
                    }
                    tryAddStats(mySide.stats, lifeStealStats)
                    log({
                      ...action,
                      sideIdx: mySide.sideIdx,
                      msg: `Life Steal`,
                      targetSideIdx: mySide.sideIdx,
                      stats: lifeStealStats,
                    })
                  }

                  // THORNS
                  if (
                    otherSide.stats.thorns &&
                    damage > 0 &&
                    !statsForItem.ranged
                  ) {
                    let thornsDamage = otherSide.stats.thorns
                    const maxThornsDamage = Math.round(
                      damage * MAX_THORNS_MULTIPLIER,
                    )
                    thornsDamage = Math.min(maxThornsDamage, thornsDamage)

                    const thornsStats: Stats = {
                      health: -1 * thornsDamage,
                    }
                    addStats(mySide.stats, thornsStats)
                    log({
                      ...action,
                      sideIdx: otherSide.sideIdx,
                      msg: `Thorns`,
                      targetSideIdx: mySide.sideIdx,
                      stats: thornsStats,
                      itemIdx: undefined,
                    })
                  }
                } else {
                  log({
                    ...action,
                    msg: 'Miss',
                    targetSideIdx: otherSide.sideIdx,
                  })
                }
              }
            }
          }
        }

        // We do that after all actions, so that haste is applied to the cooldown
        // action.time += calcCooldown({
        //   cooldown: trigger.cooldown,
        //   stats: mySide.stats,
        // })
      } else {
        const exhaustiveCheck: never = action
        throw new Error(
          `Unhandled action type: ${JSON.stringify(exhaustiveCheck)}`,
        )
      }

      // END OF ACTION CHECK
      const dead = sides.some((side) => (side.stats.health ?? 0) <= 0)
      if (dead) {
        return endOfMatch()
      }
    }

    // UPDATE COOLDOWN
    for (const action of futureActions) {
      if (action.time !== time) continue
      if (action.type === 'itemTrigger') {
        const side = sides[action.sideIdx]
        const item = side.items[action.itemIdx]
        const trigger = item.triggers![action.triggerIdx]
        if (trigger.type === 'startOfBattle') {
          action.time = MAX_MATCH_TIME
        }
        const statsForItem = item.statsItem
          ? sumStats2(side.stats, item.statsItem)
          : side.stats
        const cooldown = calcCooldown({
          cooldown: trigger.cooldown,
          stats: statsForItem,
          tags: item.tags ?? [],
        })
        action.time += cooldown
      }
    }

    // END OF TICK CHECK
    if (time > MAX_MATCH_TIME) {
      log({ msg: 'MAX_MATCH_TIME', sideIdx: -1 })
      return endOfMatch()
    }

    time++
  }
}
