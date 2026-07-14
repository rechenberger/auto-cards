import assert from 'node:assert/strict'
import test from 'node:test'
import { SimulationInputDto } from '@/contracts/admin'
import { runSimulation } from './simulation'

test('simulation input enforces selection and work budgets', () => {
  const invalid = SimulationInputDto.safeParse({
    noOfBots: 100,
    noOfRepeats: 100,
    simulationSeed: ['too-large'],
    startingGold: 0,
    startingItems: ['hero'],
    noOfBotsSelected: 101,
    noOfSelectionRounds: 100,
  })

  assert.equal(invalid.success, false)
  if (!invalid.success) {
    assert.match(
      invalid.error.issues.map((issue) => issue.message).join(' '),
      /Selected bots|work budget/,
    )
  }
})

test('a small admin simulation produces a serializable final result', async () => {
  const input = SimulationInputDto.parse({
    noOfBots: 2,
    noOfRepeats: 1,
    simulationSeed: ['admin-test'],
    startingGold: 4,
    startingItems: ['hero'],
    noOfBotsSelected: 1,
    noOfSelectionRounds: 1,
  })

  const result = await runSimulation(input)
  assert.equal(result.done, true)
  assert.equal(result.selectionRound, 1)
  assert.ok(result.bots.length >= 1)
  assert.doesNotThrow(() => JSON.stringify(result))
})
