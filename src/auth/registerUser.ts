import { db } from '@/db/db'
import { schema } from '@/db/schema-export'
import bcrypt from 'bcrypt'
import { Credentials } from './credentialsSchema'

export const registerUser = async (credentials: Credentials) => {
  const existingUser = await db.query.users.findFirst({
    where: (s, { eq }) => eq(s.email, credentials.email),
  })
  if (existingUser) {
    throw new Error('Email already taken')
  }

  const passwordHash = await bcrypt.hash(credentials.password, 10)

  await db.insert(schema.users).values({
    id: crypto.randomUUID(),
    email: credentials.email,
    passwordHash,
  })
}
