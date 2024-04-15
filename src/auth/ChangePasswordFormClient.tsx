'use client'

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
import { createZodForm } from '@/lib/useZodForm'
import { SuperActionPromise } from '@/super-action/action/createSuperAction'
import { useSuperAction } from '@/super-action/action/useSuperAction'
import Link from 'next/link'
import { z } from 'zod'

const ChangePasswordSchema = z
  .object({
    password: z.string().min(1),
    confirmPassword: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'Passwords do not match',
      })
    }
  })

type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>

const [useLoginForm] = createZodForm(ChangePasswordSchema)

export const ChangePasswordFormClient = ({
  action,
  email,
  redirectUrl,
}: {
  action: (data: ChangePasswordSchema) => SuperActionPromise
  email?: string
  redirectUrl?: string
}) => {
  const { trigger, isLoading } = useSuperAction({
    action: async () => {
      return action(form.getValues())
    },
    catchToast: true,
  })

  const disabled = isLoading

  const form = useLoginForm({
    defaultValues: {},
    disabled,
  })

  return (
    <>
      <div className="mb-2">
        <CardTitle>Change Password</CardTitle>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async () => {
            await trigger()
          })}
          className="flex flex-col gap-4"
        >
          {!!email && (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input name="email" type="email" disabled value={email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2 mt-4 justify-end">
            {!!redirectUrl && (
              <Link href={redirectUrl} passHref>
                <Button variant={'outline'} type="button" disabled={disabled}>
                  Skip
                </Button>
              </Link>
            )}
            <Button type="submit" disabled={disabled}>
              Change Password
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
