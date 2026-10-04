import { Alert, AlertDescription } from '@/components/ui/alert'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { View } from '@/lib/types'
import { Sidebar, views } from '@/components/layout/sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { Topbar } from '@/components/layout/topbar'
import { MemoryBrowser } from '@/features/memories/memory-browser'
import { Skeleton } from '@/components/ui/skeleton'
const MemoryGraph = lazy(() =>
  import('@/features/graph/memory-graph').then((module) => ({ default: module.MemoryGraph })),
)
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
    <SidebarProvider>
      <Sidebar view={view} onNavigate={navigate} />
      <SidebarInset className="min-w-0 border">
        <Topbar view={view} />
        <div className="min-w-0 flex-1 space-y-6 p-4 lg:p-6">
          {notice && (
            <Alert
              id="notice"
              variant={notice.error ? 'destructive' : 'default'}
              role="status"
              aria-live="polite"
            >
              <AlertDescription>{notice.message}</AlertDescription>
            </Alert>
          )}
          {visited.has('memories') && (
            <section className="tab" hidden={view !== 'memories'}>
              <ErrorBoundary name="Memories">
                <MemoryBrowser />
              </ErrorBoundary>
            </section>
          )}
          {visited.has('graph') && (
            <section className="tab" hidden={view !== 'graph'}>
              <ErrorBoundary name="Memory graph">
                <Suspense
                  fallback={<Skeleton className="h-96 w-full" aria-label="Loading graph" />}
                >
                  <MemoryGraph />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
          {visited.has('handoffs') && (
            <section className="tab" hidden={view !== 'handoffs'}>
              <ErrorBoundary name="Handoffs">
                <HandoffsView notify={notify} />
              </ErrorBoundary>
            </section>
          )}
          {visited.has('connections') && (
            <section className="tab" hidden={view !== 'connections'}>
              <ErrorBoundary name="Connections">
                <ConnectionsView notify={notify} />
              </ErrorBoundary>
            </section>
          )}
          <footer className="pt-6 text-xs text-muted-foreground">
            Memory is context to review. Your current instructions and verified state take
            precedence.
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
