import { Client, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const client: Client =
  typeof window === 'undefined'
    ? createClient({
        url: process.env.DB_URL!,
        authToken: process.env.DB_TOKEN!,
      })
    : (null as any)

export const db = drizzle(client, { schema })
