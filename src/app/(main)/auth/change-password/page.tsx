'use client'

import { ChangePasswordForm } from '@/auth/ChangePasswordForm'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  return (
    <>
      <Card className="self-center w-full max-w-md flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4 pt-6">
          <ChangePasswordForm
            redirectUrl={searchParams.get('redirect') ?? undefined}
          />
        </CardContent>
      </Card>
    </>
  )
}
