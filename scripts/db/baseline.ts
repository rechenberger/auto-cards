import {
  assertRemoteAllowed,
  connect,
  getDatabaseTarget,
  hasFlag,
  markBaseline,
} from './lib'

async function main() {
  const target = getDatabaseTarget()
  const apply = hasFlag('--apply')
  if (apply) assertRemoteAllowed(target)

  const client = connect(target)
  try {
    const result = await markBaseline(client, { apply })
    if (result === 'validated') {
      console.log(
        `Baseline schema validated for ${target.label}. No changes made.`,
      )
      console.log('Run again with --apply to record migration 0000.')
    } else if (result === 'marked') {
      console.log(
        `Recorded migration 0000 as the baseline for ${target.label}.`,
      )
    } else {
      console.log(`Baseline was already recorded for ${target.label}.`)
    }
  } finally {
    client.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
