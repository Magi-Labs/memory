import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { date } from '@/lib/format'
import type { Credential, Notify } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/shared/modal'

export function CredentialManager({ notify }: { notify: Notify }) {
  const credentials = useQuery({
    queryKey: ['credentials'],
    queryFn: ({ signal }) => api.credentials(signal),
  })
  const [name, setName] = useState('')
  const [access, setAccess] = useState('read_write')
  const [creating, setCreating] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<Credential | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  async function create(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    try {
      // The one-time token stays out of query/mutation caches and browser storage.
      const created = await api.createCredential(name, access)
      setToken(created.token)
      setName('')
      void credentials.refetch()
    } catch (error) {
      notify((error as Error).message, true)
    } finally {
      setCreating(false)
    }
  }
  async function revoke(credential: Credential) {
    setRevoking(credential.id)
    try {
      await api.revokeCredential(credential.id)
      setRevokeTarget(null)
      notify('Credential revoked.')
      void credentials.refetch()
    } catch (error) {
      notify((error as Error).message, true)
    } finally {
      setRevoking(null)
    }
  }
  async function copy() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      notify('Copied to clipboard.')
    } catch {
      notify('Could not copy. Select and copy the credential manually.', true)
    }
  }
  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div>
            <CardTitle>Agent & device credentials</CardTitle>
            <p className="text-xs text-muted-foreground">
              Last used records an authenticated request, not successful task completion.
            </p>
          </div>
        </div>
        <form className="flex flex-wrap items-end gap-4" onSubmit={(event) => void create(event)}>
          <Label className="flex flex-col items-start gap-2">
            Name
            <Input
              required
              maxLength={100}
              placeholder="Claude · laptop"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Label>
          <Label className="flex flex-col items-start gap-2">
            Access
            <NativeSelect value={access} onChange={(event) => setAccess(event.target.value)}>
              <NativeSelectOption value="read_write">Read & write</NativeSelectOption>
              <NativeSelectOption value="read_only">Read only</NativeSelectOption>
            </NativeSelect>
          </Label>
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create credential'}
          </Button>
        </form>
        {credentials.error && (
          <Alert variant="destructive">
            <AlertDescription>{credentials.error.message}</AlertDescription>
          </Alert>
        )}
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / device</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.data?.credentials.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell>
                    {credential.name}
                    <p className="text-xs text-muted-foreground">{credential.prefix}</p>
                  </TableCell>
                  <TableCell>
                    {credential.scopes.includes('write') ? 'Read & write' : 'Read only'}
                  </TableCell>
                  <TableCell>{date(credential.last_used_at)}</TableCell>
                  <TableCell className={credential.revoked_at ? 'revoked' : ''}>
                    <Badge variant={credential.revoked_at ? 'outline' : 'secondary'}>
                      {credential.revoked_at ? 'Revoked' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!credential.revoked_at && (
                      <Button
                        variant="outline"

                        disabled={revoking === credential.id}
                        onClick={() => setRevokeTarget(credential)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {credentials.isPending && (
          <p className="text-sm text-muted-foreground" role="status">
            Loading credentials…
          </p>
        )}
        {credentials.data && !credentials.data.credentials.length && (
          <p className="text-sm text-muted-foreground">
            No credentials yet. Give each agent or device its own credential.
          </p>
        )}
        <AlertDialog
          open={!!revokeTarget}
          onOpenChange={(open) => {
            if (!open && !revoking) setRevokeTarget(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke {revokeTarget?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Clients using this credential will lose access immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!revoking}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!!revoking}
                onClick={(event) => {
                  event.preventDefault()
                  if (revokeTarget) void revoke(revokeTarget)
                }}
              >
                Revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Modal
          id="token-dialog"
          open={token !== null}
          title="Your new credential"
          onClose={() => setToken(null)}
        >
          <p>Copy it now. It is shown once; only its hash is stored.</p>
          <div className="flex flex-wrap gap-2 rounded-md bg-muted p-3 text-sm break-all">
            <code>{token}</code>
            <Button onClick={() => void copy()}>Copy</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Closing this window clears the token from the page. If you lose it, revoke it and create
            another.
          </p>
        </Modal>
      </CardContent>
    </Card>
  )
}
