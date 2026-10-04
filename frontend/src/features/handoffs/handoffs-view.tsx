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
    <>
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
      <div className="callout">
        Agents can use <code>get_handoff</code> and <code>save_handoff</code> over MCP. Saving a
        handoff calls no memory-layer LLM.
      </div>
      {list.isPending && (
        <p className="muted" role="status">
          Loading handoffs…
        </p>
      )}
      {list.error && (
        <p className="error" role="alert">
          {list.error.message}
        </p>
      )}
      <div className="memory-grid">
        {list.data?.handoffs.map((item) => (
          <Button
            variant="ghost"
            className="memory-card"
            key={item.project}
            onClick={() => void open(item.project)}
            disabled={loadingProject !== null}
          >
            <h3>{item.project}</h3>
            <p>{item.context.goal}</p>
            <div className="card-meta">
              <span className="status">v{item.version}</span>
              <span>{item.author}</span>
            </div>
          </Button>
        ))}
      </div>
      {list.data && !list.data.handoffs.length && (
        <p className="empty">
          No saved task handoffs yet. Create one here or ask an agent to save before switching.
        </p>
      )}
      {editor && (
        <HandoffEditor item={editor.item} onClose={() => setEditor(null)} notify={notify} />
      )}
    </>
  )
}
