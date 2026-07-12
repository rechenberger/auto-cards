import { MeDto } from '@/contracts/auth-api'
import { db } from '@/db/db'
import { users } from '@/db/schema-auth'
import { getUserName } from '@/game/getUserName'
import { defaultThemeId, ThemeId } from '@/game/themeSchema'
import { eq } from 'drizzle-orm'
import { isDev } from '@/auth/dev'

export const getMe = async (userId: string) => {
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      isAdmin: true,
      passwordHash: true,
      themeId: true,
    },
    where: eq(users.id, userId),
    with: {
      accounts: {
        columns: { provider: true },
      },
    },
  })
  if (!user) return null
  const theme = ThemeId.safeParse(user.themeId)

  return MeDto.parse({
    id: user.id,
    displayName: getUserName({ user }),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    image: user.image,
    isAdmin: Boolean(user.isAdmin || isDev()),
    themeId: theme.success ? theme.data : defaultThemeId,
    hasPassword: Boolean(user.passwordHash),
    providers: [...new Set(user.accounts.map((account) => account.provider))],
  })
}
