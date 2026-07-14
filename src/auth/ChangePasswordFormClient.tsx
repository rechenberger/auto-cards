'use client'

import { useUpdateMe } from '@/client/api/auth'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MeDto, UpdatePasswordRequest } from '@/contracts/auth-api'
import { createZodForm } from '@/lib/useZodForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { normalizeClientRedirect } from './clientRedirect'
import { useRequiredMe } from './useRequiredMe'

const [usePasswordForm] = createZodForm(UpdatePasswordRequest)

export const ChangePasswordFormClient = ({
  redirectUrl,
}: {
  redirectUrl?: string
}) => {
  const me = useRequiredMe()
  if (me.isLoading || me.data === null) {
    return <QueryLoading label="Loading account…" />
  }
  if (me.isError || !me.data) {
    return <QueryError error={me.error} retry={() => void me.refetch()} />
  }
  return <ChangePasswordFormInner me={me.data} redirectUrl={redirectUrl} />
}

const ChangePasswordFormInner = ({
  me,
  redirectUrl,
}: {
  me: MeDto
  redirectUrl?: string
}) => {
  const updateMe = useUpdateMe()
  const router = useRouter()
  const [notice, setNotice] = useState<string | null>(null)
  const form = usePasswordForm({
    defaultValues: {
      type: 'password',
      password: '',
      confirmPassword: '',
    },
  })
  const disabled = form.formState.isSubmitting || updateMe.isPending

  return (
    <>
      <div className="mb-2">
        <CardTitle>Change Password</CardTitle>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            form.clearErrors('root')
            setNotice(null)
            try {
              await updateMe.mutateAsync(values)
              form.reset({
                type: 'password',
                password: '',
                confirmPassword: '',
              })
              router.refresh()
              if (redirectUrl) {
                router.replace(normalizeClientRedirect(redirectUrl))
              } else {
                setNotice('Password updated.')
              }
            } catch (error) {
              form.setError('root', {
                message:
                  error instanceof Error ? error.message : 'Please try again',
              })
            }
          })}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              name="email"
              type="email"
              autoComplete="username"
              className="text-base"
              disabled
              value={me.email}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="text-base"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    className="text-base"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="min-h-6 text-sm" aria-live="polite">
            {form.formState.errors.root?.message && (
              <p className="text-destructive" role="alert">
                {form.formState.errors.root.message}
              </p>
            )}
            {notice && <p className="text-muted-foreground">{notice}</p>}
          </div>

          <div className="flex flex-row gap-2 mt-4 justify-end">
            {redirectUrl &&
              (disabled ? (
                <Button
                  variant="outline"
                  type="button"
                  className="min-h-11 touch-manipulation"
                  disabled
                >
                  Skip
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="min-h-11 touch-manipulation"
                  asChild
                >
                  <Link href={normalizeClientRedirect(redirectUrl)}>Skip</Link>
                </Button>
              ))}
            <Button
              type="submit"
              className="min-h-11 touch-manipulation"
              disabled={disabled}
            >
              {disabled ? 'Saving…' : 'Change password'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
