import { LoadoutData } from '@/db/schema-zod'
import {
  rngFloat,
  rngGenerator,
  rngOrder,
  SeedArray,
  SeedRng,
} from '@/game/seed'
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
import { TriggerEventType } from './ItemDefinition'
import { getAllModifiedStats } from './modifiers'
import { orderItems } from './orderItems'
import { randomStatsResolve } from './randomStatsResolve'
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
  isDone?: boolean
}

export type MatchReport = Awaited<ReturnType<typeof generateMatch>>

export type GenerateMatchInput = {
  participants: {
    loadout: LoadoutData
  }[]
  seed: SeedArray
  skipLogs?: boolean
}

const generateMatchStateSides = async (input: GenerateMatchInput) => {
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
  return sides
}

const generateMatchStateFutureActionsItems = async (
  input: GenerateMatchInput,
) => {
  const sides = await generateMatchStateSides(input)
  const futureActionsItems = rngOrder({
    items: sides,
    seed: [...input.seed, 'futureActions'],
  }).flatMap((side) => {
    return side.items.flatMap((item, itemIdx) => {
      return (
        item.triggers?.flatMap((trigger, triggerIdx) => {
          let time: number | undefined = undefined
          if (trigger.type === 'interval') {
            time = calcCooldown({
              cooldown: trigger.cooldown,
              stats: side.stats,
              tags: item.tags ?? [], // FIXME: add tags from other items
            })
          }
          if (trigger.type === 'startOfBattle') {
            time = 0
          }
          if (trigger.forceStartTime) {
            time = trigger.forceStartTime
          }

          return range(item.count ?? 1).map((itemCounter) => ({
            type: trigger.type,
            time,
            lastUsed: 0,
            usedCount: 0,
            currentCooldown: trigger.type === 'interval' ? time : undefined,
            sideIdx: side.sideIdx,
            itemIdx,
            triggerIdx,
            itemCounter, // to have different seed for each item in a stack
          }))
        }) || []
      )
    })
  })
  return { sides, futureActionsItems }
}

type FutureActionItem = Awaited<
  ReturnType<typeof generateMatchStateFutureActionsItems>
>['futureActionsItems'][number]

export const generateMatchState = async (input: GenerateMatchInput) => {
  const { sides, futureActionsItems } =
    await generateMatchStateFutureActionsItems(input)

  const futureActionsBase = [{ type: 'baseTick' as const, time: 0 }]

  const futureActions = [...futureActionsBase, ...futureActionsItems]
  return { sides, futureActions }
}

export type MatchState = Awaited<ReturnType<typeof generateMatchState>>

export const NOT_ENOUGH_MSG = 'Not enough'

export const generateMatch = async ({
  skipLogs,
  participants,
  seed: _seed,
}: GenerateMatchInput) => {
  let time = 0

  const state = await generateMatchState({ participants, seed: _seed })
  const { sides, futureActions } = state

  const seed = rngGenerator({ seed: _seed })

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
    const sidesRandom = rngOrder({ items: sides, seed })
    const sidesByHealth = orderBy(
      sidesRandom,
      (s) => s.stats.health ?? 0,
      'asc',
    )
    const [loser, winner] = sidesByHealth
    log({ msg: 'Game over', sideIdx: loser.sideIdx })
    log({ msg: 'Loses', sideIdx: loser.sideIdx })
    log({ msg: 'Wins!', sideIdx: winner.sideIdx, isDone: true })
    return { logs, winner, loser, time }
  }

  const baseTick = ({ side }: { side: MatchState['sides'][number] }) => {
    // REGEN
    const missingHealth = (side.stats.healthMax ?? 0) - (side.stats.health ?? 0)
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
    const fatigue = Math.max(1 + (time - FATIGUE_STARTS_AT) / BASE_TICK_TIME, 0)
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

  type TriggerHandlerInput = {
    seed: SeedRng
    action: FutureActionItem
    baseLogMsg?: string
  }

  const triggerHandler = (input: TriggerHandlerInput) => {
    const { seed, action } = input

    const { sideIdx, itemIdx, triggerIdx } = action
    const mySide = sides[sideIdx]
    const otherSide = sides[1 - sideIdx] // lol
    const item = mySide.items[itemIdx]
    const trigger = item.triggers![triggerIdx]

    const baseLog = {
      sideIdx,
      itemIdx,
      triggerIdx,
      msg: input.baseLogMsg,
    }

    let statsForItem = item.statsItem
      ? sumStats2(mySide.stats, item.statsItem)
      : mySide.stats

    const allStats = trigger.modifiers?.length
      ? getAllModifiedStats({
          state,
          itemIdx,
          sideIdx,
          triggerIdx,
          statsForItem,
        })
      : trigger
    const { statsRequired, statsSelf, statsEnemy, attack } = allStats
    if ('statsForItem' in allStats) {
      statsForItem = allStats.statsForItem ?? statsForItem
    }

    if (trigger.maxCount && action.usedCount >= trigger.maxCount) {
      return
    }

    if (trigger.chancePercent) {
      const chancePercent = trigger.chancePercent
      const chanceRng = rngFloat({ seed, max: 100 })
      const doesTrigger = chanceRng <= chancePercent
      if (!doesTrigger) {
        return
      }
    }

    let hasRequiredStats = true
    if (statsRequired) {
      const enough = hasStats(statsForItem, statsRequired)
      if (!enough) {
        log({
          ...baseLog,
          msg: NOT_ENOUGH_MSG,
          targetSideIdx: mySide.sideIdx,
          stats: statsRequired,
        })
        hasRequiredStats = false
      }
    }

    if (hasRequiredStats) {
      action.usedCount++

      if (statsSelf) {
        tryAddStats(mySide.stats, statsSelf)
        log({
          ...baseLog,
          stats: statsSelf,
          targetSideIdx: mySide.sideIdx,
        })
        randomStatsResolve({
          stats: mySide.stats,
          seed,
          onRandomStat: ({ stats, randomStat }) => {
            log({
              ...baseLog,
              stats,
              msg: randomStat,
              targetSideIdx: mySide.sideIdx,
            })
          },
        })
      }
      if (trigger.statsItem) {
        if (!item.statsItem) {
          item.statsItem = {}
        }
        tryAddStats(item.statsItem, trigger.statsItem)
        log({
          ...baseLog,
          msg: 'apply to item',
          stats: trigger.statsItem,
          targetSideIdx: mySide.sideIdx,
          targetItemIdx: itemIdx,
        })
        randomStatsResolve({
          stats: item.statsItem,
          seed,
          onRandomStat: ({ stats, randomStat }) => {
            log({
              ...baseLog,
              stats,
              msg: randomStat,
              targetSideIdx: mySide.sideIdx,
              targetItemIdx: itemIdx,
            })
          },
        })
      }
      const tryingToReach = !!statsEnemy || !!attack
      if (tryingToReach) {
        const canReachEnemy = otherSide.stats.flying
          ? !!statsForItem.flying || !!statsForItem.ranged
          : true
        if (!canReachEnemy) {
          log({
            ...baseLog,
            targetSideIdx: otherSide.sideIdx,
            msg: 'Cannot Reach',
          })
        } else {
          if (statsEnemy) {
            tryAddStats(otherSide.stats, statsEnemy)
            log({
              ...baseLog,
              stats: statsEnemy,
              targetSideIdx: otherSide.sideIdx,
            })
            randomStatsResolve({
              stats: otherSide.stats,
              seed,
              onRandomStat: ({ stats, randomStat }) => {
                log({
                  ...baseLog,
                  stats,
                  msg: randomStat,
                  targetSideIdx: otherSide.sideIdx,
                })
              },
            })
          }
          if (attack) {
            const accuracyRng = rngFloat({
              seed,
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
              triggerEvents({
                eventType: 'onAttackBeforeHit',
                parentTrigger: input,
                itemIdx,
                sideIdx,
                itemCounter: action.itemCounter,
              })
              triggerEvents({
                eventType: 'onDefendBeforeHit',
                parentTrigger: input,
                sideIdx: otherSide.sideIdx,
              })

              let damage = attack.damage ?? 0

              if (statsForItem.empower) {
                damage += statsForItem.empower
              }

              if (statsForItem.drunk) {
                damage *= 1 + statsForItem.drunk / 100
              }

              const critChance = statsForItem.aim ?? 0
              const doesCrit = rngFloat({ seed, max: 100 }) <= critChance
              if (doesCrit) {
                damage *= CRIT_MULTIPLIER
                if (statsForItem?.critDamage) {
                  damage *= 1 + statsForItem.critDamage / 100
                }
              }
              damage = Math.round(damage)

              let blockedDamage = 0
              if (!statsForItem?.unblockable) {
                blockedDamage = Math.min(damage, otherSide.stats.block ?? 0)
              }
              damage -= blockedDamage
              const targetStats: Stats = {
                health: -1 * damage,
                block: -1 * blockedDamage,
              }
              addStats(otherSide.stats, targetStats)
              log({
                ...baseLog,
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
                    ...baseLog,
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
                  ...baseLog,
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
                  ...baseLog,
                  sideIdx: otherSide.sideIdx,
                  msg: `Thorns`,
                  targetSideIdx: mySide.sideIdx,
                  stats: thornsStats,
                  itemIdx: undefined,
                })
              }

              triggerEvents({
                eventType: 'onAttackAfterHit',
                parentTrigger: input,
                itemIdx,
                sideIdx,
                itemCounter: action.itemCounter,
              })
              triggerEvents({
                eventType: 'onDefendAfterHit',
                parentTrigger: input,
                sideIdx: otherSide.sideIdx,
              })
            } else {
              log({
                ...baseLog,
                msg: 'Miss',
                targetSideIdx: otherSide.sideIdx,
              })
            }
          }
        }
      }
    }

    action.lastUsed = time

    // We do that after all actions, so that haste is applied to the cooldown
    // action.time += calcCooldown({
    //   cooldown: trigger.cooldown,
    //   stats: mySide.stats,
    // })
  }

  const triggerEvents = ({
    eventType,
    parentTrigger,
    itemIdx,
    sideIdx,
    itemCounter,
  }: {
    eventType: TriggerEventType
    parentTrigger: TriggerHandlerInput
    itemIdx?: number
    sideIdx: number
    itemCounter?: number
  }) => {
    // Find Actions
    const actions = futureActions.filter(
      (a) =>
        a.type === eventType &&
        a.sideIdx === sideIdx &&
        (itemIdx === undefined || a.itemIdx === itemIdx) &&
        (itemCounter === undefined || a.itemCounter === itemCounter),
    )

    // Trigger Actions
    for (const action of actions) {
      if (action.type !== eventType) continue // type guard
      // check uses etc
      triggerHandler({
        seed: parentTrigger.seed,
        action,
        baseLogMsg: eventType,
      })
    }
  }

  while (true) {
    const nextTime = minBy(futureActions, (a) => a.time ?? Infinity)?.time
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
          seed,
        })) {
          baseTick({
            side,
          })
        }
      } else {
        // TRIGGER ITEM
        triggerHandler({
          seed,
          action,
        })
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
      if (action.type !== 'baseTick') {
        const side = sides[action.sideIdx]
        const item = side.items[action.itemIdx]
        const trigger = item.triggers![action.triggerIdx]
        if (trigger.type === 'startOfBattle') {
          action.time = MAX_MATCH_TIME // TODO: find a more elegant solution
        } else if (trigger.type === 'interval') {
          const statsForItem = item.statsItem
            ? sumStats2(side.stats, item.statsItem)
            : side.stats
          const cooldown = calcCooldown({
            cooldown: trigger.cooldown,
            stats: statsForItem,
            tags: item.tags ?? [],
          })
          action.time += cooldown
          action.currentCooldown = cooldown
        }
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
