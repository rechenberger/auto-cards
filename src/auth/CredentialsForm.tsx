'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createZodForm } from '@/lib/useZodForm'
import { Credentials, credentialsSchema } from './credentialsSchema'

export const [useCredentialsForm, useCredentialsFormContext] =
  createZodForm(credentialsSchema)

export const CredentialsForm = ({
  onSubmit,
}: {
  onSubmit: (credentials: Credentials) => Promise<void>
}) => {
  const form = useCredentialsForm({
    defaultValues: {
      email: 'you@example.com',
      password: 'your-password',
    },
  })
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (credentials) => {
            await onSubmit(credentials)
          })}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Sign In</Button>
        </form>
      </Form>
    </>
  )
}
