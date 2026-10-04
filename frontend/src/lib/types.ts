export type View = 'memories' | 'graph' | 'handoffs' | 'connections'
export type Notify = (message: string, error?: boolean) => void
export interface MemoryFact {
  id?: string
  memory: string
  version?: number
  isLatest?: boolean
  isInference?: boolean
  isForgotten?: boolean
  createdAt?: string
}
export interface SourceDocument {
  id: string
  title?: string
  summary?: string
  content?: string
  raw?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  metadata?: { source?: string }
  memories?: MemoryFact[]
}
export interface SearchMatch {
  id?: string
  documentId?: string
  document?: { id?: string }
  title?: string
  summary?: string
  content?: string
  memory?: string | { memory?: string }
  chunk?: string | { content?: string }
  score?: number
}
export interface LibraryResult {
  documents?: SourceDocument[]
  memories?: SourceDocument[]
  pagination?: { totalItems?: number; totalPages?: number }
}
export interface GraphNode {
  id: string
  kind: 'document' | 'memory' | 'reference'
  label: string
  data: SourceDocument & Partial<MemoryFact>
}
export interface GraphEdge {
  source: string
  target: string
  type: string
}
export interface GraphResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  coverage: string
  truncated?: boolean
  unavailableDocuments?: number
}
export interface HandoffContext {
  goal: string
  summary?: string
  decisions?: string[]
  next_steps?: string[]
  references?: string[]
}
export interface Handoff {
  project: string
  version: number
  context: HandoffContext
  author: string
  created_at: string
}
export interface Credential {
  id: string
  name: string
  prefix: string
  scopes: string[]
  last_used_at?: string
  revoked_at?: string
}
export interface ClientConfig {
  mcp_url: string
}
