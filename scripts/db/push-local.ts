import { spawnSync } from 'node:child_process'
import { getDatabaseTarget } from './lib'

const target = getDatabaseTarget()
if (!target.localPath) {
  console.error('db:push:local only accepts a file: SQLite database.')
  process.exit(1)
}

const result = spawnSync('pnpm', ['exec', 'drizzle-kit', 'push'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    DB_URL: target.url,
    DB_TOKEN: '',
  },
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
