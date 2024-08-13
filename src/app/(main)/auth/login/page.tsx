import { LoginForm } from '@/auth/LoginForm'
import { getIsLoggedIn } from '@/auth/getMyUser'
import { Card, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function Page({
  searchParams: { redirect: redirectRaw },
}: {
  searchParams: { redirect?: string }
}) {
  const redirectUrl = redirectRaw && decodeURIComponent(redirectRaw)
  const isLoggedIn = await getIsLoggedIn()
  if (isLoggedIn) {
    redirect(redirectUrl ?? '/')
  }

  return (
    <>
      <Card className="self-center w-full max-w-md flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4 pt-6">
          <LoginForm redirectUrl={redirectUrl} />
        </CardContent>
      </Card>
    </>
  )
}
