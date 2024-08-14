import { LoadoutData } from '@/db/schema-zod'
import { rngFloat, SeedArray } from '@/game/seed'
import { cloneDeep, first, map, orderBy } from 'lodash-es'
import { getItemByName } from './allItems'
import { calcStats, hasNegativeStats, sumStats } from './calcStats'
import { BASE_TICK_TIME, MAX_MATCH_TIME } from './config'
import { Stats } from './stats'

export type MatchLog = {
  time: number
  msg?: string
  sideIdx: number
  itemIdx?: number
  itemName?: string
  triggerIdx?: number
  stats?: Stats
  targetSideIdx?: number
  stateSnapshot: MatchState
}

export type MatchReport = Awaited<ReturnType<typeof generateMatch>>

type GenerateMatchInput = {
  participants: {
    loadout: LoadoutData
  }[]
  seed: SeedArray
}

export const generateMatchState = async (input: GenerateMatchInput) => {
  const sides = await Promise.all(
    input.participants.map(async (p, idx) => {
      const itemDefs = await Promise.all(
        p.loadout.items.map((i) => getItemByName(i.name)),
      )
      const stats = await calcStats({ loadout: p.loadout })

      const items = itemDefs.map((item) => ({
        ...item,
        triggers: map(item.triggers, (trigger) => ({
          ...trigger,
          lastUsed: 0,
          // nextUse: time + trigger.cooldown,
        })),
      }))

      return {
        items,
        stats,
        sideIdx: idx,
      }
    }),
  )
  return { sides }
}
export type MatchState = Awaited<ReturnType<typeof generateMatchState>>

export const generateMatch = async ({
  participants,
  seed,
}: GenerateMatchInput) => {
  let time = 0

  const state = await generateMatchState({ participants, seed })
  const { sides } = state

  const logs: MatchLog[] = []
  const log = (log: Omit<MatchLog, 'time' | 'itemName' | 'stateSnapshot'>) => {
    const itemName =
      log.itemIdx !== undefined
        ? sides[log.sideIdx].items[log.itemIdx].name
        : undefined
    const stateSnapshot = cloneDeep(state)
    logs.push({ ...log, time, itemName, stateSnapshot })
  }

  const endOfMatch = () => {
    const sidesByHealth = orderBy(sides, (s) => s.stats.health ?? 0, 'asc')
    const [loser, winner] = sidesByHealth
    log({ msg: 'Game over', sideIdx: loser.sideIdx })
    log({ msg: 'Loses', sideIdx: loser.sideIdx })
    log({ msg: 'Wins!', sideIdx: winner.sideIdx })
    return { logs }
  }

  while (true) {
    const seedTick = [...seed, time]
    const nextBaseTick =
      time % BASE_TICK_TIME === 0
        ? time
        : time + BASE_TICK_TIME - (time % BASE_TICK_TIME)
    let futureActions = [
      { type: 'baseTick' as const, time: nextBaseTick },
      ...sides.flatMap((side, sideIdx) => {
        return side.items.flatMap((item, itemIdx) => {
          return item.triggers.flatMap((trigger, triggerIdx) => {
            if (trigger.type !== 'interval') return []
            return {
              type: 'itemTrigger' as const,
              time: trigger.lastUsed + trigger.cooldown,
              sideIdx,
              itemIdx,
              triggerIdx,
            }
          })
        })
      }),
    ]
    futureActions = orderBy(futureActions, 'time', 'asc')
    const nextTime = first(futureActions)?.time
    if (nextTime === undefined) {
      throw new Error('no next time')
    }

    // GOTO FUTURE
    time = nextTime
    const actions = futureActions.filter((a) => a.time === time)

    for (const action of actions) {
      if (action.type === 'baseTick') {
        for (const side of sides) {
          const regenStats = {
            health: side.stats.regen,
            stamina: side.stats.staminaRegen,
          }
          side.stats = sumStats(side.stats, regenStats)
          log({
            msg: 'Regenerate',
            sideIdx: side.sideIdx,
            stats: regenStats,
            targetSideIdx: side.sideIdx,
          })
        }
      } else if (action.type === 'itemTrigger') {
        const seedAction = [...seedTick, action]
        const trigger =
          sides[action.sideIdx].items[action.itemIdx].triggers[
            action.triggerIdx
          ]
        trigger.lastUsed = time
        const mySide = sides[action.sideIdx]
        const otherSide = sides[1 - action.sideIdx] // lol

        const { statsSelf, statsEnemy, attack } = trigger
        if (statsSelf) {
          const newStats = sumStats(mySide.stats, statsSelf)
          if (hasNegativeStats({ stats: newStats })) {
            log({
              ...action,
              msg: 'Not enough',
              targetSideIdx: mySide.sideIdx,
              stats: statsSelf,
            })
            continue
          }
          mySide.stats = newStats
          log({
            ...action,
            stats: statsSelf,
            targetSideIdx: mySide.sideIdx,
          })
        }
        if (statsEnemy) {
          otherSide.stats = sumStats(otherSide.stats, statsEnemy)
          log({
            ...action,
            stats: statsEnemy,
            targetSideIdx: otherSide.sideIdx,
          })
        }
        if (attack) {
          const accuracyRng = rngFloat({ seed: seedAction, max: 100 })
          const doesHit = accuracyRng <= (attack.accuracy ?? 0)
          if (doesHit) {
            const damage = attack.damage ?? 0
            const targetStats = {
              health: -1 * damage,
            }
            otherSide.stats = sumStats(otherSide.stats, targetStats)
            log({
              ...action,
              msg: `Hit`,
              targetSideIdx: otherSide.sideIdx,
              stats: targetStats,
            })
          } else {
            log({
              ...action,
              msg: 'Miss',
              targetSideIdx: otherSide.sideIdx,
            })
          }
        }
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

    // END OF TICK CHECK
    if (time > MAX_MATCH_TIME) {
      log({ msg: 'MAX_MATCH_TIME', sideIdx: -1 })
      return endOfMatch()
    }

    time++
  }
}
