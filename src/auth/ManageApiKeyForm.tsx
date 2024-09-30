import {
  streamDialog,
  streamToast,
  superAction,
} from '@/super-action/action/createSuperAction'
import { getMyUser } from './getMyUser'
import { db } from '@/db/db'
import { apiKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { ActionButton } from '@/super-action/button/ActionButton'
import { Trash2 } from 'lucide-react'
import { streamRevalidatePath } from '@/super-action/action/streamRevalidatePath'

export const ManageApiKeyForm = async () => {
  const user = await getMyUser()

  if (!user) {
    return null
  }

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, user.id),
  })

  if (keys.length === 0) {
    return <p>No API keys found</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell>
                {key.expiresAt
                  ? new Date(key.expiresAt).toLocaleDateString()
                  : 'Never'}
              </TableCell>
              <TableCell>
                <ActionButton
                  hideIcon
                  variant="ghost"
                  size="icon"
                  action={async () => {
                    'use server'
                    return superAction(async () => {
                      streamDialog({
                        title: 'Delete API Key',
                        content: (
                          <>
                            <p>
                              Are you sure you want to delete the API key &quot;
                              {key.name}&quot;?
                            </p>
                            <p>This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                action={async () => {
                                  'use server'
                                  return superAction(async () => {
                                    await db
                                      .delete(apiKeys)
                                      .where(eq(apiKeys.id, key.id))
                                    streamToast({
                                      title: 'API Key Deleted',
                                      description: `The API key "${key.name}" has been deleted.`,
                                    })
                                    streamDialog(null)
                                    streamRevalidatePath('/api/rest', 'layout')
                                  })
                                }}
                              >
                                Delete
                              </ActionButton>
                            </div>
                          </>
                        ),
                      })
                    })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
