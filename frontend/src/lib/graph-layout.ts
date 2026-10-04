import type { GraphResult } from './types'
export interface Point {
  x: number
  y: number
}
export function graphLayout(graph: GraphResult, query: string, latest: boolean) {
  let nodes = graph.nodes.filter(
    (item) =>
      !latest ||
      item.kind === 'document' ||
      (item.kind === 'memory' && item.data.isLatest !== false && !item.data.isForgotten),
  )
  if (query) {
    const matched = new Set(
      nodes
        .filter((item) => (item.label + ' ' + item.id).toLowerCase().includes(query.toLowerCase()))
        .map((item) => item.id),
    )
    const visible = new Set(matched)
    for (const edge of graph.edges)
      if (matched.has(edge.source) || matched.has(edge.target)) {
        visible.add(edge.source)
        visible.add(edge.target)
      }
    nodes = nodes.filter((item) => visible.has(item.id))
  }
  const ids = new Set(nodes.map((item) => item.id))
  const edges = graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
  const documents = nodes.filter((item) => item.kind === 'document')
  const groups = new Map(documents.map((item) => [item.id, [] as string[]]))
  const owned = new Set<string>()
  for (const edge of edges)
    if (edge.type === 'contains' && groups.has(edge.source) && !owned.has(edge.target)) {
      groups.get(edge.source)!.push(edge.target)
      owned.add(edge.target)
    }
  const columns = Math.max(1, Math.ceil(Math.sqrt(documents.length || 1)))
  const positions = new Map<string, Point>()
  const largestGroup = Math.max(0, ...[...groups.values()].map((children) => children.length))
  const spacing = Math.max(340, 200 + largestGroup * 11)
  documents.forEach((item, index) => {
    const x = 170 + (index % columns) * spacing,
      y = 160 + Math.floor(index / columns) * spacing
    positions.set(item.id, { x, y })
    const children = groups.get(item.id)!
    const radius = Math.max(100, Math.min(spacing * 0.37, children.length * 10))
    children.forEach((id, child) => {
      const angle = (child * Math.PI * 2) / children.length - Math.PI / 2
      positions.set(id, { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius })
    })
  })
  let extra = 0
  const extraStart = 160 + Math.ceil(documents.length / columns) * spacing
  for (const item of nodes)
    if (!positions.has(item.id)) {
      positions.set(item.id, {
        x: 100 + (extra % columns) * spacing,
        y: extraStart + Math.floor(extra / columns) * 100,
      })
      extra++
    }
  return {
    nodes,
    edges,
    positions,
    width: Math.max(400, ...[...positions.values()].map((p) => p.x + 180)),
    height: Math.max(300, ...[...positions.values()].map((p) => p.y + 90)),
  }
}
