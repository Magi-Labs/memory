import type {
  ClientConfig,
  Credential,
  GraphResult,
  Handoff,
  HandoffContext,
  LibraryResult,
  SearchMatch,
  SourceDocument,
} from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'X-Memory-Request': 'dashboard',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const validation = Array.isArray(data.detail)
      ? data.detail
          .map(
            (item: { loc: string[]; msg: string }) => item.loc.slice(1).join('.') + ': ' + item.msg,
          )
          .join('; ')
      : null
    throw new ApiError(
      data.error ||
        (typeof data.detail === 'string' ? data.detail : validation) ||
        `Request failed (${response.status})`,
      response.status,
    )
  }
  return data as T
}
export const api = {
  memories: (page: number, signal?: AbortSignal) =>
    request<LibraryResult>(`/api/memories?page=${page}`, { signal }),
  document: (id: string, signal?: AbortSignal) =>
    request<SourceDocument>(`/api/memories/${encodeURIComponent(id)}`, { signal }),
  search: (query: string, signal?: AbortSignal) =>
    request<{ results: SearchMatch[] }>('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
      signal,
    }),
  graph: (signal?: AbortSignal) => request<GraphResult>('/api/graph', { signal }),
  handoffs: (signal?: AbortSignal) => request<{ handoffs: Handoff[] }>('/api/handoffs', { signal }),
  handoff: (project: string, signal?: AbortSignal) =>
    request<Handoff>(`/api/handoffs/${encodeURIComponent(project)}`, { signal }),
  saveHandoff: (
    context: HandoffContext & { project: string; expected_version: number; request_id: string },
  ) => request<Handoff>('/api/handoffs', { method: 'POST', body: JSON.stringify(context) }),
  config: (signal?: AbortSignal) => request<ClientConfig>('/api/config', { signal }),
  credentials: (signal?: AbortSignal) =>
    request<{ credentials: Credential[] }>('/api/credentials', { signal }),
  createCredential: (name: string, access: string) =>
    request<{ token: string }>('/api/credentials', {
      method: 'POST',
      body: JSON.stringify({ name, access }),
    }),
  revokeCredential: (id: string) =>
    request(`/api/credentials/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
