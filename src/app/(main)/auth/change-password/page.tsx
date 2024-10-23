import { ChangePasswordForm } from '@/auth/ChangePasswordForm'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { loginWithRedirect } from '@/auth/loginWithRedirect'
import { Card, CardContent } from '@/components/ui/card'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  const isLoggedIn = await getIsLoggedIn()
  if (!isLoggedIn) {
    await loginWithRedirect()
  }

  const redirectUrl = redirect && decodeURIComponent(redirect)

  return (
    <>
      <Card className="self-center w-full max-w-md flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4 pt-6">
          <ChangePasswordForm redirectUrl={redirectUrl} />
        </CardContent>
      </Card>
    </>
  )
}
