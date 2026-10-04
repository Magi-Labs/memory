import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SearchMatch } from '@/lib/types'
import { resultText } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/shared/icon'
import { Metadata } from '@/components/shared/metadata'
import { DocumentContent } from './document-content'

export interface MemorySelection {
  key: string
  documentId?: string
  match?: SearchMatch
}
export function MemoryDetail({
  selection,
  onClose,
}: {
  selection: MemorySelection | null
  onClose: () => void
}) {
  const source = useQuery({
    queryKey: ['document', selection?.documentId],
    queryFn: ({ signal }) => api.document(selection!.documentId!, signal),
    enabled: !!selection?.documentId,
  })
  const loading = !!selection?.documentId && source.isPending
  const title = !selection
    ? 'Select a memory'
    : loading
      ? 'Loading document…'
      : source.error
        ? 'Could not load document'
        : source.data?.title || (selection.documentId ? 'Untitled document' : 'Retrieved memory')
  return (
    <aside
      id="memory-detail"
      className="memory-detail"
      aria-labelledby="memory-detail-title"
      aria-busy={loading}
    >
      <div className="detail-heading">
        <p className="eyebrow">
          {selection?.match && !selection.documentId ? 'SEARCH RESULT' : 'SOURCE DOCUMENT'}
        </p>
        {selection && (
          <Button
            variant="ghost"
            size="icon"
            id="close-memory-detail"
            aria-label="Close document details"
            onClick={onClose}
          >
            <Icon name="close" />
          </Button>
        )}
      </div>
      <h2 id="memory-detail-title">{title}</h2>
      {!selection && (
        <p className="muted">Open a document to read its source and extracted facts.</p>
      )}
      {source.error && selection?.documentId && (
        <p role="alert" className="error">
          {source.error.message}
        </p>
      )}
      {source.data && selection?.documentId && (
        <DocumentContent key={source.data.id} source={source.data} />
      )}
      {selection?.match && !selection.documentId && (
        <>
          <p className="document-body">{resultText(selection.match)}</p>
          <Metadata
            values={[
              ['Memory ID', selection.match.id],
              ['Score', selection.match.score],
            ]}
          />
        </>
      )}
    </aside>
  )
}
