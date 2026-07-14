'use client'

import { meQueryKey, useRegister } from '@/client/api/auth'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { EmailInput, PasswordInput } from '@/contracts/auth-api'
import { createZodForm } from '@/lib/useZodForm'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { normalizeClientRedirect } from './clientRedirect'

const AuthFormData = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('login'),
      email: EmailInput,
      password: PasswordInput,
    }),
    z.object({
      type: z.literal('register'),
      email: EmailInput,
      password: PasswordInput,
      confirmPassword: PasswordInput,
      acceptTerms: z.boolean().refine(Boolean, 'Accept the terms to continue'),
    }),
    z.object({
      type: z.literal('forgotPassword'),
      email: EmailInput,
    }),
  ])
  .superRefine((data, context) => {
    if (data.type === 'register' && data.password !== data.confirmPassword) {
      context.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'Passwords do not match',
      })
    }
  })

type AuthFormData = z.infer<typeof AuthFormData>
type AuthFormType = AuthFormData['type']

const [useAuthForm] = createZodForm(AuthFormData)

const labels: Record<AuthFormType, string> = {
  login: 'Log in',
  register: 'Register',
  forgotPassword: 'Reset password',
}

export const AuthFormClient = ({ redirectUrl }: { redirectUrl?: string }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const register = useRegister()
  const [providerPending, setProviderPending] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const form = useAuthForm({
    defaultValues: {
      type: 'login',
      email: process.env.NEXT_PUBLIC_AUTH_DEFAULT_EMAIL ?? '',
      password: process.env.NEXT_PUBLIC_AUTH_DEFAULT_PASSWORD ?? '',
    },
  })
  const type = form.watch('type')
  const isPending =
    form.formState.isSubmitting || register.isPending || !!providerPending
  const redirectTo = normalizeClientRedirect(redirectUrl)

  const setType = (nextType: AuthFormType) => {
    form.setValue('type', nextType)
    form.clearErrors()
    setNotice(null)
  }

  const sendEmailLink = async ({
    email,
    destination,
  }: {
    email: string
    destination: string
  }) => {
    setProviderPending('resend')
    const response = await signIn('resend', {
      email,
      redirect: false,
      redirectTo: destination,
    })
    setProviderPending(null)
    if (response?.error) throw new Error('The sign-in email could not be sent')
  }

  const handleSubmit = async (data: AuthFormData) => {
    form.clearErrors('root')
    setNotice(null)
    try {
      if (data.type === 'login') {
        setProviderPending('credentials')
        const response = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          redirectTo,
        })
        setProviderPending(null)

        if (response?.error) {
          if (response.code === 'email_not_verified') {
            await sendEmailLink({ email: data.email, destination: redirectTo })
            setNotice(
              `We sent a verification link to ${data.email}. Open it to finish signing in.`,
            )
            return
          }
          throw new Error('Invalid email or password')
        }

        await queryClient.invalidateQueries({ queryKey: meQueryKey })
        router.replace(normalizeClientRedirect(response?.url, redirectTo))
        router.refresh()
        return
      }

      if (data.type === 'register') {
        await register.mutateAsync({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          acceptTerms: true,
        })
        await sendEmailLink({ email: data.email, destination: redirectTo })
        setNotice(
          `Account created. We sent a verification link to ${data.email}.`,
        )
        return
      }

      let passwordRedirect = '/auth/change-password'
      if (redirectTo !== '/') {
        passwordRedirect += `?redirect=${encodeURIComponent(redirectTo)}`
      }
      await sendEmailLink({
        email: data.email,
        destination: passwordRedirect,
      })
      setNotice(`We sent a password reset link to ${data.email}.`)
    } catch (error) {
      setProviderPending(null)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const sendDirectEmailLink = async () => {
    const valid = await form.trigger('email')
    if (!valid) {
      form.setFocus('email')
      return
    }
    const email = form.getValues('email')
    try {
      form.clearErrors('root')
      await sendEmailLink({ email, destination: redirectTo })
      setNotice(`We sent a sign-in link to ${email}.`)
    } catch (error) {
      setProviderPending(null)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const mainLabel = labels[type]

  return (
    <>
      <div className="mb-2 flex min-h-11 flex-row items-center gap-2">
        {type !== 'login' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 touch-manipulation"
            onClick={() => setType('login')}
            disabled={isPending}
            aria-label="Back to login"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
        )}
        <CardTitle>{mainLabel}</CardTitle>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    className="text-base"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {type !== 'forgotPassword' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-end gap-4">
                    <FormLabel className="flex-1">Password</FormLabel>
                    {type === 'login' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="link"
                        className="min-h-11 px-1"
                        onClick={() => setType('forgotPassword')}
                        disabled={isPending}
                      >
                        Forgot password?
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete={
                        type === 'register'
                          ? 'new-password'
                          : 'current-password'
                      }
                      className="text-base"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === 'register' && (
            <>
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
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex min-h-11 flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                        className="size-5 touch-manipulation"
                      />
                    </FormControl>
                    <FormLabel className="flex-1 cursor-pointer">
                      Accept terms
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="min-h-10 text-sm" aria-live="polite">
            {form.formState.errors.root?.message && (
              <p className="text-destructive" role="alert">
                {form.formState.errors.root.message}
              </p>
            )}
            {notice && <p className="text-muted-foreground">{notice}</p>}
          </div>

          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              type="button"
              className="min-h-11 flex-1 touch-manipulation"
              onClick={() => setType(type === 'login' ? 'register' : 'login')}
              disabled={isPending}
            >
              {type === 'login' ? 'Register' : 'Back to login'}
            </Button>
            <Button
              type="submit"
              className="min-h-11 flex-1 touch-manipulation"
              disabled={isPending}
            >
              {isPending && (
                <LoaderCircle
                  className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {mainLabel}
            </Button>
          </div>
        </form>
      </Form>

      {type === 'login' && (
        <>
          <div className="my-4 flex flex-row items-center" aria-hidden="true">
            <hr className="flex-1" />
            <span className="mx-4 text-muted-foreground">or</span>
            <hr className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 touch-manipulation"
              disabled={isPending}
              onClick={() => {
                setProviderPending('discord')
                void signIn('discord', { redirectTo })
              }}
            >
              Continue with Discord
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn('min-h-11 touch-manipulation')}
              disabled={isPending}
              onClick={() => void sendDirectEmailLink()}
            >
              Email me a sign-in link
            </Button>
          </div>
        </>
      )}
    </>
  )
}
