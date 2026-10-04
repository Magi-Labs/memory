import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SearchMatch } from '@/lib/types'
import { resultText } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    <Card
      id="memory-detail"
      className="min-w-0"
      aria-labelledby="memory-detail-title"
      aria-busy={loading}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
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
        <CardTitle id="memory-detail-title">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selection && (
          <p className="text-sm text-muted-foreground">
            Open a document to read its source and extracted facts.
          </p>
        )}
        {source.error && selection?.documentId && (
          <Alert variant="destructive">
            <AlertDescription>{source.error.message}</AlertDescription>
          </Alert>
        )}
        {source.data && selection?.documentId && (
          <DocumentContent key={source.data.id} source={source.data} />
        )}
        {selection?.match && !selection.documentId && (
          <>
            <p className="whitespace-pre-wrap text-sm">{resultText(selection.match)}</p>
            <Metadata
              values={[
                ['Memory ID', selection.match.id],
                ['Score', selection.match.score],
              ]}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
