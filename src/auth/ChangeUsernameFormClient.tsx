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
import { MeDto, UpdateUsernameRequest } from '@/contracts/auth-api'
import { createZodForm } from '@/lib/useZodForm'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { normalizeClientRedirect } from './clientRedirect'
import { useRequiredMe } from './useRequiredMe'

const [useUsernameForm] = createZodForm(UpdateUsernameRequest)

export const ChangeUsernameFormClient = ({
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
  return <ChangeUsernameFormInner me={me.data} redirectUrl={redirectUrl} />
}

const ChangeUsernameFormInner = ({
  me,
  redirectUrl,
}: {
  me: MeDto
  redirectUrl?: string
}) => {
  const updateMe = useUpdateMe()
  const router = useRouter()
  const [notice, setNotice] = useState<string | null>(null)

  const form = useUsernameForm({
    defaultValues: {
      type: 'username',
      username: me.name ?? '',
    },
  })
  const disabled = form.formState.isSubmitting || updateMe.isPending

  return (
    <>
      <div className="mb-2">
        <CardTitle>Change Username</CardTitle>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            form.clearErrors('root')
            setNotice(null)
            try {
              await updateMe.mutateAsync(values)
              router.refresh()
              if (redirectUrl) {
                router.replace(normalizeClientRedirect(redirectUrl))
              } else {
                setNotice('Username updated.')
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
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="username"
                    spellCheck={false}
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
            <Button
              type="submit"
              className="min-h-11 touch-manipulation"
              disabled={disabled}
            >
              {disabled ? 'Saving…' : 'Change username'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
