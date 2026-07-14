'use client'

import {
  useApiTokens,
  useCreateApiToken,
  useRevokeApiToken,
} from '@/client/api/apiTokens'
import type { ApiTokenDto, ApiTokenScope } from '@/contracts/api-token'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Check,
  Clipboard,
  FileJson2,
  KeyRound,
  LoaderCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { FormEvent, useState } from 'react'

const scopeLabels: Record<ApiTokenScope, string> = {
  'game:read': 'Read games',
  'game:write': 'Play and change games',
  'live:read': 'Read live matches',
  'live:write': 'Join and control live matches',
  admin: 'Admin API access',
}

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Never'

const tokenStatus = (token: ApiTokenDto) => {
  if (token.revokedAt) return 'Revoked'
  if (token.expiresAt && Date.parse(token.expiresAt) <= Date.now()) {
    return 'Expired'
  }
  return 'Active'
}

export const ApiTokenManager = () => {
  const tokens = useApiTokens()
  const createToken = useCreateApiToken()
  const revokeToken = useRevokeApiToken()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('My agent')
  const [scopes, setScopes] = useState<ApiTokenScope[]>([
    'game:read',
    'game:write',
  ])
  const [expiryDays, setExpiryDays] = useState('90')
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiTokenDto | null>(null)
  const tokenList = tokens.data?.tokens ?? []

  const setDialogOpen = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      createToken.reset()
      setCopied(false)
      setCopyFailed(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const expiresAt =
      expiryDays === 'never'
        ? null
        : new Date(
            Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1_000,
          ).toISOString()
    createToken.mutate({ name, scopes, expiresAt })
  }

  const toggleScope = (scope: ApiTokenScope, checked: boolean) => {
    setScopes((current) =>
      checked
        ? current.includes(scope)
          ? current
          : [...current, scope]
        : current.filter((item) => item !== scope),
    )
  }

  const copySecret = async () => {
    const secret = createToken.data?.secret
    if (!secret) return
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Personal API tokens</CardTitle>
            <CardDescription className="mt-1">
              Give agents and developer tools limited access to the JSON API.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="min-h-11 touch-manipulation"
            >
              <a href="/api/openapi.json">
                <FileJson2 className="mr-2 size-4" aria-hidden="true" />
                OpenAPI spec
              </a>
            </Button>
            <Button
              type="button"
              className="min-h-11 touch-manipulation"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Create token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tokens.isLoading ? (
            <div
              className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground"
              role="status"
            >
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Loading tokens…
            </div>
          ) : tokens.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load tokens</AlertTitle>
              <AlertDescription>
                {tokens.error instanceof Error
                  ? tokens.error.message
                  : 'Try again in a moment.'}
              </AlertDescription>
            </Alert>
          ) : tokenList.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No personal API tokens yet.
            </div>
          ) : (
            <ul className="divide-y rounded-lg border">
              {tokenList.map((token) => {
                const status = tokenStatus(token)
                return (
                  <li
                    key={token.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{token.name}</span>
                        <Badge
                          variant={
                            status === 'Active' ? 'secondary' : 'outline'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <code className="block text-xs text-muted-foreground">
                        {token.prefix}…
                      </code>
                      <div className="flex flex-wrap gap-1">
                        {token.scopes.map((scope) => (
                          <Badge key={scope} variant="outline">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(token.expiresAt)} · Last used:{' '}
                        {formatDate(token.lastUsedAt)}
                      </p>
                    </div>
                    {status === 'Active' && (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 touch-manipulation"
                        onClick={() => setRevokeTarget(token)}
                      >
                        <Trash2 className="mr-2 size-4" aria-hidden="true" />
                        Revoke
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          {createToken.data ? (
            <>
              <DialogHeader>
                <DialogTitle>Copy your API token</DialogTitle>
                <DialogDescription>
                  This secret is shown once. Store it in a password manager or
                  your agent&apos;s secret store.
                </DialogDescription>
              </DialogHeader>
              <Alert>
                <KeyRound className="size-4" aria-hidden="true" />
                <AlertTitle>It cannot be recovered later</AlertTitle>
                <AlertDescription>
                  If you lose it, revoke this token and create a new one.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="new-api-token">Token secret</Label>
                <Input
                  id="new-api-token"
                  value={createToken.data.secret}
                  readOnly
                  spellCheck={false}
                  className="min-h-11 font-mono text-xs"
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setDialogOpen(false)}
                >
                  Done
                </Button>
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void copySecret()}
                >
                  {copied ? (
                    <Check className="mr-2 size-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="mr-2 size-4" aria-hidden="true" />
                  )}
                  {copied ? 'Copied' : 'Copy token'}
                </Button>
                <span className="sr-only" aria-live="polite">
                  {copied
                    ? 'Token copied to clipboard'
                    : copyFailed
                      ? 'Copy failed. Select and copy the token manually.'
                      : ''}
                </span>
              </DialogFooter>
              {copyFailed && (
                <p className="text-sm text-destructive" role="alert">
                  Copy failed. Select the token above and copy it manually.
                </p>
              )}
            </>
          ) : (
            <form onSubmit={submit} className="contents">
              <DialogHeader>
                <DialogTitle>Create an API token</DialogTitle>
                <DialogDescription>
                  Select only the permissions your agent needs. You can revoke
                  the token at any time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="api-token-name">Name</Label>
                <Input
                  id="api-token-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={64}
                  required
                  autoComplete="off"
                  className="min-h-11"
                />
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Permissions</legend>
                {tokens.data?.availableScopes.map((scope) => (
                  <div key={scope} className="flex min-h-11 items-center gap-3">
                    <Checkbox
                      id={`api-token-scope-${scope}`}
                      checked={scopes.includes(scope)}
                      onCheckedChange={(checked) =>
                        toggleScope(scope, checked === true)
                      }
                      className="size-5"
                    />
                    <Label
                      htmlFor={`api-token-scope-${scope}`}
                      className="flex min-h-11 flex-1 cursor-pointer items-center"
                    >
                      {scopeLabels[scope]}
                    </Label>
                  </div>
                ))}
              </fieldset>
              <div className="space-y-2">
                <Label htmlFor="api-token-expiry">Expiry</Label>
                <select
                  id="api-token-expiry"
                  value={expiryDays}
                  onChange={(event) => setExpiryDays(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">No expiry</option>
                </select>
              </div>
              {createToken.isError && (
                <Alert variant="destructive">
                  <AlertTitle>Could not create token</AlertTitle>
                  <AlertDescription>
                    {createToken.error instanceof Error
                      ? createToken.error.message
                      : 'Try again in a moment.'}
                  </AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-h-11"
                  disabled={
                    createToken.isPending ||
                    name.trim().length === 0 ||
                    scopes.length === 0
                  }
                >
                  {createToken.isPending && (
                    <LoaderCircle
                      className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  Create token
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke API token?</DialogTitle>
            <DialogDescription>
              {revokeTarget?.name} will stop working immediately. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {revokeToken.isError && (
            <Alert variant="destructive">
              <AlertTitle>Could not revoke token</AlertTitle>
              <AlertDescription>
                {revokeToken.error instanceof Error
                  ? revokeToken.error.message
                  : 'Try again in a moment.'}
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={revokeToken.isPending}
              onClick={() => {
                if (!revokeTarget) return
                revokeToken.mutate(revokeTarget.id, {
                  onSuccess: () => setRevokeTarget(null),
                })
              }}
            >
              {revokeToken.isPending && (
                <LoaderCircle
                  className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              Revoke token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
