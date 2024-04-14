import 'dotenv-flow/config'
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  driver: 'turso',
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_TOKEN!,
  },
} satisfies Config
