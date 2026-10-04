import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { date, lines } from '@/lib/format'
import type { Handoff, Notify } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/shared/modal'

export function HandoffEditor({
  item,
  onClose,
  notify,
}: {
  item: Handoff | null
  onClose: () => void
  notify: Notify
}) {
  const client = useQueryClient()
  const context = item?.context
  const [project, setProject] = useState(item?.project || '')
  const [goal, setGoal] = useState(context?.goal || '')
  const [summary, setSummary] = useState(context?.summary || '')
  const [decisions, setDecisions] = useState((context?.decisions || []).join('\n'))
  const [next, setNext] = useState((context?.next_steps || []).join('\n'))
  const [references, setReferences] = useState((context?.references || []).join('\n'))
  const [requestId] = useState(() => crypto.randomUUID())
  const save = useMutation({
    mutationFn: () =>
      api.saveHandoff({
        project,
        goal,
        summary,
        decisions: lines(decisions),
        next_steps: lines(next),
        references: lines(references),
        expected_version: item?.version || 0,
        request_id: requestId,
      }),
    onSuccess: () => {
      notify('Handoff saved.')
      void client.invalidateQueries({ queryKey: ['handoffs'] })
      onClose()
    },
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }
  return (
    <Modal id="handoff-dialog" open onClose={onClose} title="Save a handoff">
      <form onSubmit={submit}>
        <label className="field">
          Project ID
          <Input
            required
            readOnly={!!item}
            maxLength={100}
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="my-project"
          />
        </label>
        <label className="field">
          Goal
          <Textarea
            required
            maxLength={8000}
            rows={2}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
        </label>
        <label className="field">
          Current state
          <Textarea
            maxLength={20000}
            rows={5}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
        <label className="field">
          Decisions · one per line
          <Textarea
            rows={3}
            value={decisions}
            onChange={(event) => setDecisions(event.target.value)}
          />
        </label>
        <label className="field">
          Next steps · one per line
          <Textarea rows={3} value={next} onChange={(event) => setNext(event.target.value)} />
        </label>
        <label className="field">
          Files, commits, or links · one per line
          <Textarea
            rows={2}
            value={references}
            onChange={(event) => setReferences(event.target.value)}
          />
        </label>
        <p className="muted small">
          {item
            ? `Editing version ${item.version} · ${date(item.created_at)} · ${item.author}`
            : 'New project · First revision'}
        </p>
        {save.error && (
          <p className="error" role="alert">
            {save.error.message}
          </p>
        )}
        <div className="dialog-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save handoff'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
