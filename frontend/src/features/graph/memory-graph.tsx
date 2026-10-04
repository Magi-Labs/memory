import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { date } from '@/lib/format'
import { graphLayout, type Point } from '@/lib/graph-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeading } from '@/components/shared/page-heading'
import { Metadata } from '@/components/shared/metadata'
import { DocumentModal } from '@/features/memories/document-modal'

const emptyGraph = { nodes: [], edges: [], coverage: '' }
export function MemoryGraph() {
  const graph = useQuery({ queryKey: ['graph'], queryFn: ({ signal }) => api.graph(signal) })
  const [query, setQuery] = useState('')
  const [latest, setLatest] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const svg = useRef<SVGSVGElement>(null)
  const pan = useRef<Point | null>(null)
  const layout = useMemo(
    () => graphLayout(graph.data || emptyGraph, query.trim(), latest),
    [graph.data, query, latest],
  )
  const selected = graph.data?.nodes.find((item) => item.id === selectedId)
  const fit = useCallback(() => {
    const scale = Math.min(1, 1140 / layout.width, 790 / layout.height)
    setView({ scale, x: (1200 - layout.width * scale) / 2, y: (850 - layout.height * scale) / 2 })
  }, [layout])
  useEffect(fit, [fit])
  const point = useCallback((event: { clientX: number; clientY: number }) => {
    const matrix = svg.current?.getScreenCTM()
    if (!matrix || !svg.current) return { x: 600, y: 425 }
    const position = svg.current.createSVGPoint()
    position.x = event.clientX
    position.y = event.clientY
    return position.matrixTransform(matrix.inverse())
  }, [])
  const zoom = useCallback((factor: number, position: Point = { x: 600, y: 425 }) => {
    setView((current) => {
      const scale = Math.max(0.05, Math.min(6, current.scale * factor)),
        ratio = scale / current.scale
      return {
        scale,
        x: position.x - (position.x - current.x) * ratio,
        y: position.y - (position.y - current.y) * ratio,
      }
    })
  }, [])
  useEffect(() => {
    const element = svg.current
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, point(event))
    }
    element?.addEventListener('wheel', wheel, { passive: false })
    return () => element?.removeEventListener('wheel', wheel)
  }, [zoom, point])
  const colors = { document: '#406648', memory: '#b0c783', reference: '#b5a9c9' }
  const sourceIds =
    selected?.kind === 'document'
      ? [selected.data.id]
      : (graph.data?.edges || [])
          .filter((edge) => edge.type === 'contains' && edge.target === selectedId)
          .map((edge) => edge.source.slice(9))
  return (
    <>
      <PageHeading
        eyebrow="FOLLOW THE SOURCE"
        title="Memory graph"
        description="Explore the documents, extracted facts, and version history."
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
      <div className="graph-toolbar">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a node…"
          aria-label="Filter graph nodes"
        />
        <label>
          <input
            type="checkbox"
            checked={latest}
            onChange={(event) => setLatest(event.target.checked)}
          />{' '}
          Current facts only
        </label>
        <Button variant="outline" onClick={fit}>
          Fit
        </Button>
        <Button variant="outline" aria-label="Zoom out" onClick={() => zoom(0.8)}>
          −
        </Button>
        <Button variant="outline" aria-label="Zoom in" onClick={() => zoom(1.25)}>
          +
        </Button>
      </div>
      <div className="graph-workspace">
        <div className="graph-stage">
          {layout.nodes.length === 0 && (
            <div className="graph-state" role="status">
              <h2>
                {graph.isPending
                  ? 'Loading your memory graph…'
                  : graph.isError
                    ? 'Could not load the graph'
                    : graph.data?.nodes.length
                      ? 'No matching memories'
                      : 'No memories yet'}
              </h2>
              <p>
                {graph.isPending
                  ? 'Reading source documents and their extracted facts.'
                  : graph.isError
                    ? graph.error.message
                    : graph.data?.nodes.length
                      ? 'Change the search or turn off the current-facts filter.'
                      : 'Saved documents and extracted facts will appear here.'}
              </p>
              {graph.isError && (
                <Button variant="outline" disabled={graph.isFetching} onClick={() => void graph.refetch()}>
                  Try again
                </Button>
              )}
            </div>
          )}
          <svg
            ref={svg}
            id="graph-svg"
            role="img"
            aria-label="Interactive memory graph"
            viewBox="0 0 1200 850"
            onPointerDown={(event) => {
              if ((event.target as Element).closest('.graph-node')) return
              const position = point(event)
              pan.current = { x: position.x - view.x, y: position.y - view.y }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!pan.current) return
              const position = point(event)
              setView((current) => ({
                ...current,
                x: position.x - pan.current!.x,
                y: position.y - pan.current!.y,
              }))
            }}
            onPointerUp={() => {
              pan.current = null
            }}
            onPointerCancel={() => {
              pan.current = null
            }}
          >
            <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
              {layout.edges.map((edge, index) => {
                const a = layout.positions.get(edge.source)!,
                  b = layout.positions.get(edge.target)!
                return (
                  <line
                    key={index}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={`graph-edge${edge.type === 'previous_version' ? ' version' : ''}`}
                  >
                    <title>
                      {edge.type === 'contains'
                        ? 'Source document contains this memory'
                        : 'Memory points to its previous version'}
                    </title>
                  </line>
                )
              })}
              {layout.nodes.map((item) => {
                const position = layout.positions.get(item.id)!
                return (
                  <g
                    key={item.id}
                    transform={`translate(${position.x} ${position.y})`}
                    className={`graph-node${selectedId === item.id ? ' selected' : ''}`}
                    tabIndex={0}
                    role="button"
                    aria-label={item.label}
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedId(item.id)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedId(item.id)
                      }
                    }}
                  >
                    <circle
                      r={item.kind === 'document' ? 14 : 8}
                      fill={colors[item.kind]}
                      stroke="var(--paper)"
                      strokeWidth={2}
                    />
                    <title>{item.label}</title>
                    <text x={0} y={item.kind === 'document' ? 32 : 23} textAnchor="middle">
                      {item.label.length > 34 ? item.label.slice(0, 31) + '…' : item.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
          <div className="graph-hint">Drag to pan · Scroll to zoom · Select a node</div>
        </div>
        <aside className="graph-detail">
          {selected ? (
            <>
              <p className="eyebrow">
                {selected.kind === 'document' ? 'SOURCE DOCUMENT' : 'MEMORY'}
              </p>
              <h2>{selected.label}</h2>
              <Metadata
                values={[
                  ['ID', selected.data.id],
                  ['Version', selected.data.version],
                  ['Current', selected.data.isLatest],
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
            <>
              <p className="eyebrow">NODE DETAILS</p>
              <h2>Select a memory</h2>
              <p className="muted">
                Connections show actual document membership and previous versions returned by your
                backend.
              </p>
            </>
          )}
        </aside>
      </div>
      <div className="legend">
        <span>
          <i className="legend-document" />
          Source document
        </span>
        <span>
          <i className="legend-memory" />
          Extracted fact
        </span>
        <span>
          <i className="legend-reference" />
          Unavailable reference
        </span>
        <span>Solid line: source membership</span>
        <span>Dashed line: previous version</span>
      </div>
      <p className={graph.error ? 'error' : 'muted'} role="status">
        {graph.error
          ? graph.error.message
          : graph.isFetching
            ? 'Reading document-linked memories…'
            : `${layout.nodes.length} visible nodes · ${layout.edges.length} connections. ${graph.data?.coverage || ''}${graph.data?.truncated ? ' Showing at most 1,000 source documents.' : ''}${graph.data?.unavailableDocuments ? ` ${graph.data.unavailableDocuments} document details unavailable.` : ''}`}
      </p>
      <DocumentModal id={documentId} onClose={() => setDocumentId(null)} />
    </>
  )
}
