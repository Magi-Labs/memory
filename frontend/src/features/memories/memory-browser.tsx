import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { date, excerpt, resultText, sourceName } from '@/lib/format'
import type { SourceDocument } from '@/lib/types'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription } from '@/components/ui/item'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Empty, EmptyHeader, EmptyDescription } from '@/components/ui/empty'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
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
    <div className="space-y-6">
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
      <form className="flex flex-wrap gap-2" onSubmit={submit}>
        <div className="flex-1 min-w-48">
          <Input
            id="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={4000}
            placeholder="Search facts, preferences, and past decisions…"
            aria-label="Search memories"
          />
        </div>
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
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardContent className="space-y-4">
            <CardDescription>
              <span id="memory-count" role="status">
                {result.isFetching
                  ? search
                    ? 'Searching…'
                    : 'Loading documents…'
                  : `${total} ${search ? 'search results' : 'source documents'}`}
              </span>
            </CardDescription>
            <div
              className="max-h-[65vh] space-y-2 overflow-y-auto"
              id="memory-list"
              ref={list}
              aria-label="Source documents"
              aria-busy={result.isFetching}
            >
              {result.error && (
                <Alert variant="destructive">
                  <AlertDescription>{result.error.message}</AlertDescription>
                </Alert>
              )}
              {!result.isPending && !result.error && !rows.length && (
                <Empty>
                  <EmptyHeader>
                    <EmptyDescription>
                      {search
                        ? 'No relevant memories found. Try a more specific query.'
                        : 'No memories yet. Save your first durable memory through a connected agent.'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {rows.map((row) => (
                <Item
                  key={row.key}
                  variant="outline"
                  className={selection?.key === row.key ? 'bg-accent' : ''}
                >
                  <ItemContent className="min-w-0">
                    <Button
                      variant="link"
                      className="h-auto justify-start whitespace-normal p-0 text-left"
                      aria-pressed={selection?.key === row.key}
                      aria-controls="memory-detail"
                      onClick={() => setSelection(row)}
                    >
                      {row.title}
                    </Button>
                    <ItemDescription>{row.preview}</ItemDescription>
                    <p className="text-xs text-muted-foreground">{row.meta}</p>
                  </ItemContent>
                </Item>
              ))}
            </div>
            {!search && pages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      disabled={page <= 1 || result.isFetching}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-2 text-sm">
                      Page {page} of {pages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      disabled={page >= pages || result.isFetching}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
        <MemoryDetail selection={selection} onClose={closeDetail} />
      </div>
    </div>
  )
}
