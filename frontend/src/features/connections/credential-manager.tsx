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
    if (
      !window.confirm(
        `Revoke “${credential.name}”? Clients using this credential will lose access immediately.`,
      )
    )
      return
    setRevoking(credential.id)
    try {
      await api.revokeCredential(credential.id)
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
    <section className="panel credentials-panel">
      <div className="heading compact">
        <div>
          <h2>Agent & device credentials</h2>
          <p className="muted small">
            Last used records an authenticated request, not successful task completion.
          </p>
        </div>
      </div>
      <form className="credential-form" onSubmit={(event) => void create(event)}>
        <label className="field">
          Name
          <Input
            required
            maxLength={100}
            placeholder="Claude · laptop"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          Access
          <select value={access} onChange={(event) => setAccess(event.target.value)}>
            <option value="read_write">Read & write</option>
            <option value="read_only">Read only</option>
          </select>
        </label>
        <Button type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create credential'}
        </Button>
      </form>
      {credentials.error && (
        <p className="error" role="alert">
          {credentials.error.message}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Client / device</th>
              <th>Access</th>
              <th>Last used</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {credentials.data?.credentials.map((credential) => (
              <tr key={credential.id}>
                <td>
                  {credential.name}
                  <small>{credential.prefix}</small>
                </td>
                <td>{credential.scopes.includes('write') ? 'Read & write' : 'Read only'}</td>
                <td>{date(credential.last_used_at)}</td>
                <td className={credential.revoked_at ? 'revoked' : ''}>
                  {credential.revoked_at ? 'Revoked' : 'Active'}
                </td>
                <td>
                  {!credential.revoked_at && (
                    <Button
                      variant="outline"
                      className="danger"
                      disabled={revoking === credential.id}
                      onClick={() => void revoke(credential)}
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {credentials.isPending && (
        <p className="muted" role="status">
          Loading credentials…
        </p>
      )}
      {credentials.data && !credentials.data.credentials.length && (
        <p className="muted">No credentials yet. Give each agent or device its own credential.</p>
      )}
      <Modal
        id="token-dialog"
        open={token !== null}
        title="Your new credential"
        onClose={() => setToken(null)}
      >
        <p>Copy it now. It is shown once; only its hash is stored.</p>
        <div className="copy-row token-row">
          <code>{token}</code>
          <Button onClick={() => void copy()}>Copy</Button>
        </div>
        <p className="muted">
          Closing this window clears the token from the page. If you lose it, revoke it and create
          another.
        </p>
      </Modal>
    </section>
  )
}
