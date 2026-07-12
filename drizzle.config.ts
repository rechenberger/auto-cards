import 'dotenv-flow/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DB_URL ?? 'file:./db.sqlite',
    authToken: process.env.DB_TOKEN,
  },
  strict: true,
  verbose: true,
})
