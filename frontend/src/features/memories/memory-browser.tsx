import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { date, excerpt, resultText, sourceName } from '@/lib/format'
import type { SourceDocument } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/shared/icon'
import { PageHeading } from '@/components/shared/page-heading'
import { MemoryDetail, type MemorySelection } from './memory-detail'

interface LibraryRow extends MemorySelection {
  title: string
  preview: string
  meta: string
}
export function MemoryBrowser() {
  const client = useQueryClient()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<MemorySelection | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const documents = useQuery({
    queryKey: ['memories', page],
    queryFn: ({ signal }) => api.memories(page, signal),
    enabled: !search,
  })
  const matches = useQuery({
    queryKey: ['search', search],
    queryFn: ({ signal }) => api.search(search, signal),
    enabled: !!search,
  })
  const rows = useMemo<LibraryRow[]>(
    () =>
      search
        ? (matches.data?.results || []).map((item, index) => ({
            key: 'result-' + index,
            documentId: item.documentId || item.document?.id,
            match: item,
            title: item.title || resultText(item),
            preview: item.summary || resultText(item),
            meta: 'Search match',
          }))
        : (documents.data?.documents || documents.data?.memories || []).map(
            (item: SourceDocument) => {
              const observedDate = date(item.updatedAt || item.createdAt, true)
              return {
                key: item.id,
                documentId: item.id,
                title: item.title || 'Untitled document',
                preview: excerpt(item),
                meta: sourceName(item) + (observedDate ? ' · ' + observedDate : ''),
              }
            },
          ),
    [search, matches.data, documents.data],
  )
  useEffect(() => {
    setSelection((current) => rows.find((row) => row.key === current?.key) || rows[0] || null)
  }, [rows])
  const result = search ? matches : documents
  const total = search ? rows.length : (documents.data?.pagination?.totalItems ?? rows.length)
  const pages = documents.data?.pagination?.totalPages || 1
  function submit(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setSearch(query.trim())
  }
  function refresh() {
    void client.invalidateQueries({ queryKey: search ? ['search', search] : ['memories', page] })
    if (selection?.documentId)
      void client.invalidateQueries({ queryKey: ['document', selection.documentId] })
  }
  function closeDetail() {
    const selected = list.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    setSelection(null)
    selected?.focus()
  }
  return (
    <>
      <PageHeading
        title="Your memories"
        description="A shared place for what your agents should remember."
        action={
          <Button
            id="refresh-memories"
            variant="outline"
            disabled={result.isFetching}
            onClick={refresh}
          >
            <Icon name="refresh" />
            Refresh
          </Button>
        }
      />
      <form className="searchbar" onSubmit={submit}>
        <label className="search-input">
          <Icon name="search" />
          <Input
            id="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={4000}
            placeholder="Search facts, preferences, and past decisions…"
            aria-label="Search memories"
          />
        </label>
        <Button type="submit" disabled={result.isFetching}>
          Search
        </Button>
        <Button
          id="show-all"
          type="button"
          variant="outline"
          onClick={() => {
            setQuery('')
            setSearch('')
            setPage(1)
            void client.invalidateQueries({ queryKey: ['memories'] })
          }}
        >
          Show all
        </Button>
      </form>
      <div className={`memory-workspace${selection ? ' has-detail' : ''}`}>
        <div className="memory-library">
          <div className="section-label">
            <span id="memory-count" role="status">
              {result.isFetching
                ? search
                  ? 'Searching…'
                  : 'Loading documents…'
                : `${total} ${search ? 'search results' : 'source documents'}`}
            </span>
          </div>
          <div
            className="memory-list"
            id="memory-list"
            ref={list}
            aria-label="Source documents"
            aria-busy={result.isFetching}
          >
            {result.error && (
              <p className="empty error" role="alert">
                {result.error.message}
              </p>
            )}
            {!result.isPending && !result.error && !rows.length && (
              <p className="empty">
                {search
                  ? 'No relevant memories found. Try a more specific query.'
                  : 'No memories yet. Save your first durable memory through a connected agent.'}
              </p>
            )}
            {rows.map((row) => (
              <Button
                key={row.key}
                variant="ghost"
                className={`memory-row${selection?.key === row.key ? ' selected' : ''}`}
                aria-pressed={selection?.key === row.key}
                aria-controls="memory-detail"
                onClick={() => setSelection(row)}
              >
                <Icon name="document" />
                <div className="memory-row-copy">
                  <h3 title={row.title}>{row.title}</h3>
                  <p>{row.preview}</p>
                  <span className="row-meta">{row.meta}</span>
                </div>
              </Button>
            ))}
          </div>
          {!search && pages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                disabled={page <= 1 || result.isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= pages || result.isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        <MemoryDetail selection={selection} onClose={closeDetail} />
      </div>
    </>
  )
}
