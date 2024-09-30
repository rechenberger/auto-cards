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

const CreateApiKeySchema = z.object({
  name: z.string().min(1),
  expiresAt: z.date().optional(),
})

type CreateApiKeySchema = z.infer<typeof CreateApiKeySchema>

const [useCreateApiKeyForm] = createZodForm(CreateApiKeySchema)

export const CreateApiKeyFormClient = ({
  action,
}: {
  action: (data: CreateApiKeySchema) => SuperActionPromise
}) => {
  const { trigger, isLoading } = useSuperAction({
    action: async () => {
      return action(form.getValues())
    },
    catchToast: true,
  })

  const disabled = isLoading

  const form = useCreateApiKeyForm({
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires At</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value?.toISOString().split('T')[0]}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2 mt-4 justify-end">
            <Button type="submit" disabled={disabled}>
              Create API Key
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
