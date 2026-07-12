'use client'

import { normalizeClientRedirect } from '@/auth/clientRedirect'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const Home = () => {
  const searchParams = useSearchParams()
  const redirectRaw = searchParams.get('redirect')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  useEffect(() => {
    setRedirectUrl(normalizeClientRedirect(redirectRaw))
  }, [redirectRaw])
  return (
    <Card className="self-center w-full max-w-md flex flex-col gap-4">
      <CardContent className="flex flex-col gap-4 pt-6 items-center">
        <div>Click to complete email login</div>
        {redirectUrl ? (
          <Button
            variant="default"
            className="min-h-11 touch-manipulation"
            asChild
          >
            <a href={redirectUrl}>Continue</a>
          </Button>
        ) : (
          <div className="min-h-11 text-sm text-muted-foreground" role="status">
            Preparing secure login…
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Home
