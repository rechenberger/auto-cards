import { User } from '@/db/schema-zod'

export const getUserName = ({
  user,
}: {
  user: Pick<User, 'id' | 'name' | 'email'>
}) => {
  if (user.name) return user.name
  if (user.email) return user.email.split('@')[0]
  return `User ${user.id.substring(0, 4)}`
}
