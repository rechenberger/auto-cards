import assert from 'node:assert/strict'
import test from 'node:test'
import type { ItemDefinition } from './ItemDefinition'
import { GenerateMatchInput, generateMatch } from './generateMatch'

const replayInput: GenerateMatchInput = {
  participants: [
    {
      loadout: {
        items: [{ name: 'hero' }, { name: 'woodenSword' }],
      },
    },
    {
      loadout: {
        items: [{ name: 'hero' }, { name: 'woodenBuckler' }],
      },
    },
  ],
  seed: ['deterministic-replay'],
  skipLogs: true,
}

test('a fixed replay input produces an identical report', () => {
  assert.deepEqual(generateMatch(replayInput), generateMatch(replayInput))
})

test('the deterministic default does not consult a wall clock', () => {
  let clockReads = 0
  generateMatch(replayInput, {
    now: () => {
      clockReads++
      return clockReads
    },
  })
  assert.equal(clockReads, 0)
})

test('generateMatch uses an explicitly injected item catalog', () => {
  const allItems = [
    {
      name: 'hero',
      price: 0,
      shop: false,
      stats: { health: 1, healthMax: 1 },
    },
    {
      name: 'experience',
      price: 0,
      shop: false,
      stats: { health: 100, healthMax: 100 },
    },
  ] satisfies ItemDefinition[]

  const report = generateMatch({
    participants: [
      { loadout: { items: [{ name: 'hero' }] } },
      { loadout: { items: [{ name: 'experience' }] } },
    ],
    seed: ['injected-catalog'],
    skipLogs: true,
    allItems,
  })

  assert.equal(report.winner.sideIdx, 1)
})
