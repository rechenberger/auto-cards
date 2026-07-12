import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  assertRemoteAllowed,
  connect,
  getDatabaseTarget,
  migrateDatabase,
} from './lib'

async function main() {
  const target = getDatabaseTarget()
  assertRemoteAllowed(target)
  if (target.localPath) {
    await mkdir(dirname(target.localPath), { recursive: true })
  }
  const client = connect(target)
  try {
    await migrateDatabase(client)
    console.log(`All Drizzle migrations applied to ${target.label}.`)
  } finally {
    client.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
