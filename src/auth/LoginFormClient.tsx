'use client'

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
import { createZodForm } from '@/lib/useZodForm'
import { cn } from '@/lib/utils'
import { SuperActionPromise } from '@/super-action/action/createSuperAction'
import { useSuperAction } from '@/super-action/action/useSuperAction'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import { z } from 'zod'
import { credentialsSchema } from './credentialsSchema'

const LoginDataSchema = credentialsSchema
  .and(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('login'),
      }),
      z.object({
        type: z.literal('register'),
        confirmPassword: z.string().min(1),
        acceptTerms: z.boolean().refine((v) => !!v, 'required'),
      }),
    ]),
  )
  .superRefine((data, ctx) => {
    if (data.type === 'register') {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          code: 'custom',
          message: 'Passwords do not match',
        })
      }
    }
  })

type LoginData = z.infer<typeof LoginDataSchema>

const [useLoginForm] = createZodForm(LoginDataSchema)

export const LoginFormClient = ({
  action,
  alternatives,
  showAlternativesOnRegister = false,
}: {
  action: (data: LoginData) => SuperActionPromise
  alternatives?: ReactNode
  showAlternativesOnRegister?: boolean
}) => {
  const { trigger, isLoading } = useSuperAction({
    action: async () => {
      return action(form.getValues())
    },
    catchToast: true,
  })

  const form = useLoginForm({
    defaultValues: {
      type: 'login',
      email: 'you@example.com',
      password: 'your-password',
    },
    disabled: isLoading,
  })

  const registering = form.watch('type') === 'register'
  const setRegistering = (r: boolean) => {
    form.setValue('type', r ? 'register' : 'login')
  }

  return (
    <>
      <div className="mb-2 flex flex-row gap-4 items-center">
        {registering ? (
          <>
            <Button
              variant={'ghost'}
              size="icon"
              className="-m-2.5"
              onClick={() => setRegistering(false)}
            >
              <ArrowLeft className="size-4" />
              {/* <CardTitle>Register</CardTitle> */}
            </Button>
          </>
        ) : (
          <></>
        )}
        <CardTitle>{registering ? 'Register' : 'Login'}</CardTitle>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async () => {
            await trigger()
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
          {registering && (
            <>
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
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        required
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="flex-1 m-0">Accept Terms</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <div className="flex flex-row gap-2 mt-4">
            <Button
              variant={'outline'}
              type="button"
              className={cn('flex-1')}
              onClick={() => setRegistering(!registering)}
            >
              {registering ? 'Back to Login' : 'Register'}
            </Button>
            <Button type="submit" className="flex-1">
              {registering ? 'Register' : 'Login'}
            </Button>
          </div>
        </form>
      </Form>

      {alternatives && (!registering || showAlternativesOnRegister) && (
        <>
          <div className="flex flex-row items-center my-4">
            <hr className="flex-1" />
            <span className="mx-4 text-border">or</span>
            <hr className="flex-1" />
          </div>
          {alternatives}
        </>
      )}
    </>
  )
}
