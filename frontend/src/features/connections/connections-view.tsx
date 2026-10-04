import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Notify } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { PageHeading } from '@/components/shared/page-heading'
import { CredentialManager } from './credential-manager'
import { clientSetup, type ClientKind } from './client-config'

export function ConnectionsView({ notify }: { notify: Notify }) {
  const config = useQuery({ queryKey: ['config'], queryFn: ({ signal }) => api.config(signal) })
  const [client, setClient] = useState<ClientKind>('codex')
  const setup = config.data ? clientSetup(client, config.data.mcp_url) : null
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      notify('Copied to clipboard.')
    } catch {
      notify('Could not copy. Select and copy the setup text manually.', true)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ONE MEMORY, MANY CLIENTS"
        title="Connections"
        description="Give each agent or device its own revocable credential."
      />
      {config.error && (
        <p role="alert" className="error">
          {config.error.message}
        </p>
      )}
      <div className="connection-layout">
        <section className="panel">
          <h2>MCP endpoint</h2>
          <div className="copy-row">
            <code>{config.data?.mcp_url || 'Loading…'}</code>
            <Button
              variant="outline"
              disabled={!config.data}
              onClick={() => config.data && void copy(config.data.mcp_url)}
            >
              Copy
            </Button>
          </div>
          <p className="muted">Streamable HTTP · Authorization: Bearer &lt;your token&gt;</p>
          <label className="field">
            Client setup
            <select
              value={client}
              onChange={(event) => setClient(event.target.value as ClientKind)}
            >
              <option value="codex">Codex</option>
              <option value="claude">Claude Code</option>
              <option value="generic">Hermes / other MCP clients</option>
              <option value="chatgpt">ChatGPT web</option>
            </select>
          </label>
          <p className="muted">{setup?.description}</p>
          <pre>{setup?.config}</pre>
          <Button
            variant="outline"
            disabled={!setup}
            onClick={() => setup && void copy(setup.config)}
          >
            Copy setup
          </Button>
          <p className="muted small">
            Create a credential below. Store it in your device’s secret store or environment. Setup
            examples use placeholders.
          </p>
        </section>
        <section className="panel">
          <h2>The handoff habit</h2>
          <ol className="steps">
            <li>
              Before starting, read the project’s latest handoff and search relevant memories.
            </li>
            <li>
              Before switching, save the current goal, decisions, next steps, and file or commit
              references.
            </li>
            <li>On the next client, resume the same project ID and verify the current files.</li>
          </ol>
          <p className="muted">
            An MCP connection enables tools. Automatic capture and injection depend on each client’s
            hooks or instructions.
          </p>
        </section>
      </div>
      <CredentialManager notify={notify} />
    </>
  )
}
