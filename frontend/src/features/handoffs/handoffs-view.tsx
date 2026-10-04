import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Handoff, Notify } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { PageHeading } from '@/components/shared/page-heading'
import { HandoffEditor } from './handoff-editor'

export function HandoffsView({ notify }: { notify: Notify }) {
  const list = useQuery({ queryKey: ['handoffs'], queryFn: ({ signal }) => api.handoffs(signal) })
  const [editor, setEditor] = useState<{ item: Handoff | null } | null>(null)
  const [loadingProject, setLoadingProject] = useState<string | null>(null)
  async function open(project: string) {
    setLoadingProject(project)
    try {
      setEditor({ item: await api.handoff(project) })
    } catch (error) {
      notify((error as Error).message, true)
    } finally {
      setLoadingProject(null)
    }
  }
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="PICK UP WHERE YOU LEFT OFF"
        title="Task handoffs"
        description="Keep the goal, decisions, and next steps together when you switch."
        action={
          <Button disabled={loadingProject !== null} onClick={() => setEditor({ item: null })}>
            New handoff
          </Button>
        }
      />
      <Alert>
        <AlertDescription>
          Agents can use <code>get_handoff</code> and <code>save_handoff</code> over MCP. Saving a
          handoff calls no memory-layer LLM.
        </AlertDescription>
      </Alert>
      {list.isPending && (
        <p className="text-sm text-muted-foreground" role="status">
          Loading handoffs…
        </p>
      )}
      {list.error && (
        <Alert variant="destructive">
          <AlertDescription>{list.error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.data?.handoffs.map((item) => (
          <Card key={item.project}>
            <CardHeader>
              <CardTitle>{item.project}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.context.goal}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-2">
              <Badge variant="secondary">
                v{item.version} · {item.author}
              </Badge>
              <Button
                variant="outline"
                disabled={loadingProject !== null}
                onClick={() => void open(item.project)}
              >
                Open handoff
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {list.data && !list.data.handoffs.length && (
        <Empty>
          <EmptyHeader>
            <EmptyDescription>
              No saved task handoffs yet. Create one here or ask an agent to save before switching.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {editor && (
        <HandoffEditor item={editor.item} onClose={() => setEditor(null)} notify={notify} />
      )}
    </div>
  )
}
