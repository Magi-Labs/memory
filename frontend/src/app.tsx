import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { View } from '@/lib/types'
import { Sidebar, views } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MemoryBrowser } from '@/features/memories/memory-browser'
import { MemoryGraph } from '@/features/graph/memory-graph'
import { HandoffsView } from '@/features/handoffs/handoffs-view'
import { ConnectionsView } from '@/features/connections/connections-view'
function currentView(): View {
  return views.find((view) => view.id === location.hash.slice(1))?.id || 'memories'
}
export default function App() {
  const client = useQueryClient()
  const [view, setView] = useState<View>(currentView)
  const [visited, setVisited] = useState<Set<View>>(() => new Set([currentView()]))
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null)
  const notify = useCallback((message: string, error = false) => setNotice({ message, error }), [])
  const navigate = useCallback(
    (target: View) => {
      setView(target)
      setVisited((previous) => new Set([...previous, target]))
      history.replaceState(null, '', '#' + target)
      const keys = {
        memories: ['memories', 'search', 'document'],
        graph: ['graph'],
        handoffs: ['handoffs'],
        connections: ['config', 'credentials'],
      }
      for (const key of keys[target]) void client.invalidateQueries({ queryKey: [key] })
    },
    [client],
  )
  useEffect(() => {
    const hashChange = () => navigate(currentView())
    window.addEventListener('hashchange', hashChange)
    return () => window.removeEventListener('hashchange', hashChange)
  }, [navigate])
  useEffect(() => {
    if (!notice || notice.error) return
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice])
  return (
    <div className="shell">
      <Sidebar view={view} onNavigate={navigate} />
      <main>
        <Topbar view={view} />
        {notice && (
          <div id="notice" className={notice.error ? 'error' : ''} role="status" aria-live="polite">
            {notice.message}
          </div>
        )}
        {visited.has('memories') && (
          <section className="tab" hidden={view !== 'memories'}>
            <MemoryBrowser />
          </section>
        )}
        {visited.has('graph') && (
          <section className="tab" hidden={view !== 'graph'}>
            <MemoryGraph />
          </section>
        )}
        {visited.has('handoffs') && (
          <section className="tab" hidden={view !== 'handoffs'}>
            <HandoffsView notify={notify} />
          </section>
        )}
        {visited.has('connections') && (
          <section className="tab" hidden={view !== 'connections'}>
            <ConnectionsView notify={notify} />
          </section>
        )}
        <footer>
          Memory is context to review. Your current instructions and verified state take precedence.
        </footer>
      </main>
    </div>
  )
}
