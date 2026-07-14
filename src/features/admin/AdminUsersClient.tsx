'use client'

import { ImpersonateButton } from '@/auth/ImpersonateButton'
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from '@/client/api/admin'
import { QueryError, QueryLoading } from '@/components/api/QueryState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminUserDto } from '@/contracts/admin'
import { LoaderCircle, Plus } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { ConfirmActionButton } from './ConfirmActionButton'

const CreateUserDialog = () => {
  const createUser = useCreateAdminUser()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await createUser.mutateAsync({ email, password })
    setEmail('')
    setPassword('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11 touch-manipulation">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Create user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={(event) => void submit(event)} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Create a credential account. The user can change both fields
              later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-user-email">Email</Label>
            <Input
              id="new-user-email"
              type="email"
              autoComplete="email"
              className="h-11 text-base"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={createUser.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-password">Password</Label>
            <Input
              id="new-user-password"
              type="password"
              autoComplete="new-password"
              className="h-11 text-base"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={createUser.isPending}
            />
          </div>
          {createUser.error && (
            <p className="text-sm text-destructive" role="alert">
              {createUser.error.message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="submit"
              className="min-h-11"
              disabled={createUser.isPending}
            >
              {createUser.isPending && (
                <LoaderCircle
                  className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {createUser.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const UserCard = ({ user }: { user: AdminUserDto }) => {
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const displayName = user.name || user.email || user.id
  const tags = [...(user.hasPassword ? ['password'] : []), ...user.providers]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{displayName}</CardTitle>
        <CardDescription className="break-all">{user.id}</CardDescription>
        {!!tags.length && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <div className="break-all">{user.email}</div>
          <div className="text-sm text-muted-foreground">
            {user.emailVerified
              ? `Verified ${new Date(user.emailVerified).toLocaleString()}`
              : 'Not verified'}
          </div>
        </div>
        <div>
          <div>Theme</div>
          <div className="text-sm text-muted-foreground">
            {user.themeId ?? 'Default'}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Admin access</span>
          <ConfirmActionButton
            variant={user.isAdmin ? 'secondary' : 'outline'}
            title={
              user.isAdmin ? 'Remove admin access?' : 'Grant admin access?'
            }
            description={`This changes privileged access for ${user.email}.`}
            confirmLabel={user.isAdmin ? 'Remove admin' : 'Make admin'}
            onConfirm={() =>
              updateUser.mutateAsync({
                userId: user.id,
                input: { isAdmin: !user.isAdmin },
              })
            }
          >
            {user.isAdmin ? 'Admin enabled' : 'Make admin'}
          </ConfirmActionButton>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ConfirmActionButton
            variant="outline"
            confirmVariant="destructive"
            title="Delete user?"
            description={`This permanently deletes ${user.email} and its Auth.js relations.`}
            confirmLabel="Delete user"
            onConfirm={() => deleteUser.mutateAsync(user.id)}
          >
            Delete
          </ConfirmActionButton>
          <ImpersonateButton userId={user.id} />
        </div>
      </CardContent>
    </Card>
  )
}

export const AdminUsersClient = () => {
  const [filter, setFilter] = useState<'all' | 'admins'>('all')
  const query = useAdminUsers(filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="flex-1 text-2xl font-semibold">Users</h1>
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as 'all' | 'admins')}
        >
          <TabsList>
            <TabsTrigger value="all" className="min-h-10">
              All users
            </TabsTrigger>
            <TabsTrigger value="admins" className="min-h-10">
              Admins
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <CreateUserDialog />
      </div>
      {query.isPending ? (
        <QueryLoading label="Loading users…" />
      ) : query.error ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {query.data.users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
