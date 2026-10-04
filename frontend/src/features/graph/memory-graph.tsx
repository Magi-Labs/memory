import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Background, Controls, MiniMap, ReactFlow, Position, type Node } from '@xyflow/react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceCenter,
  type SimulationNodeDatum,
} from 'd3-force'
import { api } from '@/lib/api'
import { date } from '@/lib/format'
import { factStatusLabel, isLatestFact } from '@/lib/fact-status'
import type { GraphResult } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { PageHeading } from '@/components/shared/page-heading'
import { Metadata } from '@/components/shared/metadata'
import { DocumentModal } from '@/features/memories/document-modal'
import { useTheme } from '@/hooks/use-theme'

// Filtering is domain logic. D3 owns layout; React Flow owns rendering and interaction.
function flowGraph(graph: GraphResult | undefined, query: string, latest: boolean) {
  let nodes = (graph?.nodes || []).filter(
    (n) => !latest || n.kind === 'document' || (n.kind === 'memory' && isLatestFact(n.data)),
  )
  if (query.trim()) {
    const matched = new Set(
      nodes
        .filter((n) => `${n.label} ${n.id}`.toLowerCase().includes(query.trim().toLowerCase()))
        .map((n) => n.id),
    )
    const visible = new Set(matched)
    for (const e of graph?.edges || [])
      if (matched.has(e.source) || matched.has(e.target)) {
        visible.add(e.source)
        visible.add(e.target)
      }
    nodes = nodes.filter((n) => visible.has(n.id))
  }
  const ids = new Set(nodes.map((n) => n.id))
  const edges = (graph?.edges || []).filter((e) => ids.has(e.source) && ids.has(e.target))
  const points: (SimulationNodeDatum & { id: string })[] = nodes.map((n) => ({ id: n.id }))
  forceSimulation(points)
    .force(
      'links',
      forceLink<SimulationNodeDatum & { id: string }, { source: string; target: string }>(
        edges.map((e) => ({ source: e.source, target: e.target })),
      )
        .id((n) => n.id)
        .distance(230)
        .strength(0.25),
    )
    .force('charge', forceManyBody().strength(-600))
    .force('collision', forceCollide(110).iterations(2))
    .force('center', forceCenter(0, 0))
    .stop()
    .tick(240)
  const positions = new Map(points.map((p) => [p.id, p]))
  return {
    nodes: nodes.map((n) => {
      const p = positions.get(n.id)!
      return {
        id: n.id,
        position: { x: (p.x ?? 0) - 90, y: (p.y ?? 0) - 40 },
        data: { label: n.label.length > 70 ? n.label.slice(0, 67) + '…' : n.label },
        ariaLabel: n.label,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { width: 180, minHeight: 80 },
      } satisfies Node
    }),
    edges: edges.map((e, i) => ({
      id: `${e.source}:${e.target}:${i}`,
      source: e.source,
      target: e.target,
      label: e.type === 'previous_version' ? 'Previous version' : undefined,
      type: 'default',
    })),
  }
}

export function MemoryGraph() {
  const graph = useQuery({ queryKey: ['graph'], queryFn: ({ signal }) => api.graph(signal) })
  const [query, setQuery] = useState('')
  const [latest, setLatest] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const { theme } = useTheme()
  const flow = useMemo(() => flowGraph(graph.data, query, latest), [graph.data, query, latest])
  const selected = graph.data?.nodes.find((n) => n.id === selectedId)
  const sourceIds =
    selected?.kind === 'document'
      ? [selected.data.id]
      : (graph.data?.edges || [])
          .filter((e) => e.type === 'contains' && e.target === selectedId)
          .map((e) => e.source.slice(9))
  return (
    <div className="space-y-6">
      <PageHeading
        title="Memory graph"
        description="Explore source documents, extracted facts, and their version history."
        action={
          <Button
            variant="outline"
            disabled={graph.isFetching}
            onClick={() => void graph.refetch()}
          >
            Refresh graph
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-4">
        <Input
          className="min-w-48 flex-1"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a node…"
          aria-label="Filter graph nodes"
        />
        <div className="flex items-center gap-2">
          <Checkbox
            id="current-facts"
            checked={latest}
            onCheckedChange={(v) => setLatest(v === true)}
          />
          <Label htmlFor="current-facts">Latest versions only</Label>
        </div>
        <Badge variant="secondary">{flow.nodes.length} nodes</Badge>
        <Badge variant="outline">{flow.edges.length} connections</Badge>
      </div>
      {graph.error && (
        <Alert variant="destructive">
          <AlertDescription>{graph.error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden p-0">
          <div className="h-[65vh] min-h-96" aria-label="Memory graph canvas">
            {flow.nodes.length ? (
              <ReactFlow
                key={`${query}:${latest}:${graph.dataUpdatedAt}`}
                nodes={flow.nodes}
                edges={flow.edges}
                fitView
                minZoom={0.01}
                maxZoom={2}
                colorMode={theme}
                nodesDraggable={false}
                nodesConnectable={false}
                onNodeClick={(_, node) => setSelectedId(node.id)}
                onPaneClick={() => setSelectedId(null)}
                ariaLabelConfig={{ 'controls.fitView.ariaLabel': 'Fit graph to view' }}
              >
                <Background />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable />
              </ReactFlow>
            ) : (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyTitle>
                    {graph.isPending
                      ? 'Loading memory graph…'
                      : graph.error
                        ? 'Graph unavailable'
                        : 'No matching memories'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {graph.isPending
                      ? 'Reading documents and facts.'
                      : 'Refresh the graph or change your filters.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{selected?.kind || 'Node details'}</CardDescription>
            <CardTitle className="break-words">{selected?.label || 'Select a node'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <Metadata
                  values={[
                    ['ID', selected.data.id],
                    [
                      'Version',
                      selected.kind === 'memory' ? (selected.data.version ?? 'Unknown') : null,
                    ],
                    [
                      'Version status',
                      selected.kind === 'memory' ? factStatusLabel(selected.data) : null,
                    ],
                    ['Inferred', selected.data.isInference],
                    ['Created', selected.data.createdAt ? date(selected.data.createdAt) : null],
                  ]}
                />
                {sourceIds.map((id) => (
                  <Button key={id} variant="outline" onClick={() => setDocumentId(id)}>
                    Open source document
                  </Button>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a document or fact to inspect its evidence. Connections show source
                membership and previous versions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {graph.data?.coverage && (
        <p className="text-xs text-muted-foreground">{graph.data.coverage}</p>
      )}
      {graph.data?.truncated && (
        <Alert>
          <AlertDescription>Showing the first 1,000 source documents.</AlertDescription>
        </Alert>
      )}
      {!!graph.data?.unavailableDocuments && (
        <Alert>
          <AlertDescription>
            {graph.data.unavailableDocuments} document details unavailable.
          </AlertDescription>
        </Alert>
      )}
      <DocumentModal id={documentId} onClose={() => setDocumentId(null)} />
    </div>
  )
}
