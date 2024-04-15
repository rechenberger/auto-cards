import { getIsLoggedIn } from '@/auth/getMyUser'
import { loginWithRedirect } from '@/auth/loginWithRedirect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page({
  searchParams: { redirect: redirectUrl },
}: {
  searchParams: { redirect?: string }
}) {
  const isLoggedIn = await getIsLoggedIn()
  if (!isLoggedIn) {
    await loginWithRedirect()
  }

  return (
    <>
      <Card className="self-center w-full max-w-md flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4 pt-6">
          <CardHeader>
            <CardTitle>Change your password</CardTitle>
          </CardHeader>
        </CardContent>
      </Card>
    </>
  )
}
