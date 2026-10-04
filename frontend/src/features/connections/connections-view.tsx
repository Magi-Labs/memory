import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    <div className="space-y-6">
      <PageHeading
        eyebrow="ONE MEMORY, MANY CLIENTS"
        title="Connections"
        description="Give each agent or device its own revocable credential."
      />
      {config.error && (
        <Alert variant="destructive">
          <AlertDescription>{config.error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <CardTitle>MCP endpoint</CardTitle>
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted p-3 text-sm">
              <code>{config.data?.mcp_url || 'Loading…'}</code>
              <Button
                variant="outline"
                disabled={!config.data}
                onClick={() => config.data && void copy(config.data.mcp_url)}
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Streamable HTTP · Authorization: Bearer &lt;your token&gt;
            </p>
            <Label className="flex flex-col items-start gap-2">
              Client setup
              <NativeSelect
                value={client}
                onChange={(event) => setClient(event.target.value as ClientKind)}
              >
                <NativeSelectOption value="codex">Codex</NativeSelectOption>
                <NativeSelectOption value="claude">Claude Code</NativeSelectOption>
                <NativeSelectOption value="generic">Hermes / other MCP clients</NativeSelectOption>
                <NativeSelectOption value="chatgpt">ChatGPT web</NativeSelectOption>
              </NativeSelect>
            </Label>
            <p className="text-sm text-muted-foreground">{setup?.description}</p>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">{setup?.config}</pre>
            <Button
              variant="outline"
              disabled={!setup}
              onClick={() => setup && void copy(setup.config)}
            >
              Copy setup
            </Button>
            <p className="text-xs text-muted-foreground">
              Create a credential below. Store it in your device’s secret store or environment.
              Setup examples use placeholders.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <CardTitle>The handoff habit</CardTitle>
            <ol className="list-decimal space-y-4 pl-5 text-sm text-muted-foreground">
              <li>
                Before starting, read the project’s latest handoff and search relevant memories.
              </li>
              <li>
                Before switching, save the current goal, decisions, next steps, and file or commit
                references.
              </li>
              <li>On the next client, resume the same project ID and verify the current files.</li>
            </ol>
            <p className="text-sm text-muted-foreground">
              An MCP connection enables tools. Automatic capture and injection depend on each
              client’s hooks or instructions.
            </p>
          </CardContent>
        </Card>
      </div>
      <CredentialManager notify={notify} />
    </div>
  )
}
