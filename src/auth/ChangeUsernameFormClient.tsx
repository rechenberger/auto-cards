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
import { SuperActionWithInput } from '@/super-action/action/createSuperAction'
import { useSuperAction } from '@/super-action/action/useSuperAction'
import { z } from 'zod'

const ChangeUsernameSchema = z.object({
  username: z.string().min(1),
})

type ChangeUsernameSchema = z.infer<typeof ChangeUsernameSchema>

const [useLoginForm] = createZodForm(ChangeUsernameSchema)

export const ChangeUsernameFormClient = ({
  action,
  username,
  redirectUrl,
}: {
  action: SuperActionWithInput<ChangeUsernameSchema>
  username?: string
  redirectUrl?: string
}) => {
  const { trigger, isLoading } = useSuperAction({
    action,
    catchToast: true,
  })

  const disabled = isLoading

  const form = useLoginForm({
    defaultValues: {
      username,
    },
    disabled,
  })

  return (
    <>
      <div className="mb-2">
        <CardTitle>Change Username</CardTitle>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await trigger(values)
          })}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2 mt-4 justify-end">
            <Button type="submit" disabled={disabled}>
              Change Username
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
