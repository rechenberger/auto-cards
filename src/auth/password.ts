import bcrypt from 'bcrypt'

export const hashPassword = async ({ password }: { password: string }) => {
  return bcrypt.hash(password, 10)
}

export const comparePasswords = async ({
  password,
  hash,
}: {
  password: string
  hash: string
}) => {
  return bcrypt.compare(password, hash)
}
