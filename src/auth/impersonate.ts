import { signIn } from './auth'

export const impersonate = async ({ userId }: { userId: string }) => {
  await signIn('impersonate', {
    userId,
    secret: process.env.AUTH_SECRET!,
  })
}
