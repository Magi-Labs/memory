import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Modal } from '@/components/shared/modal'
import { DocumentContent } from './document-content'
export function DocumentModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const source = useQuery({
    queryKey: ['document', id],
    queryFn: ({ signal }) => api.document(id!, signal),
    enabled: !!id,
  })
  return (
    <Modal
      id="document-dialog"
      open={!!id}
      onClose={onClose}
      title={source.isPending ? 'Loading document…' : source.data?.title || 'Source document'}
    >
      {source.error && (
        <p role="alert" className="error">
          {source.error.message}
        </p>
      )}
      {source.data && <DocumentContent source={source.data} />}
    </Modal>
  )
}
