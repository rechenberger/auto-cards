'use client'

import { meQueryKey, useCreateImpersonationGrant } from '@/client/api/auth'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const ImpersonateButton = ({ userId }: { userId: string }) => {
  const grant = useCreateImpersonationGrant()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const impersonate = async () => {
    setError(null)
    try {
      const { token } = await grant.mutateAsync(userId)
      const response = await signIn('impersonate', {
        token,
        redirect: false,
        redirectTo: '/',
      })
      if (response?.error) throw new Error('Impersonation failed')

      await queryClient.invalidateQueries({ queryKey: meQueryKey })
      router.push('/')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impersonation failed')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 touch-manipulation"
        disabled={grant.isPending}
        onClick={() => void impersonate()}
      >
        {grant.isPending && (
          <LoaderCircle
            className="mr-2 size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        Log in as
      </Button>
      {error && (
        <span
          className="max-w-48 text-right text-xs text-destructive"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}
