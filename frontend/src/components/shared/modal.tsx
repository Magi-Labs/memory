import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from './icon'
// Native dialog supplies focus trapping, Escape and inert background without CSP inline-style exemptions.
export function Modal({
  open,
  onClose,
  title,
  children,
  id,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  id: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeHandler = useRef(onClose)
  closeHandler.current = onClose
  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog?.open) dialog?.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault()
        closeHandler.current()
      }}
    >
      <div className="dialog-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <Button variant="ghost" size="icon" aria-label={`Close ${title}`} onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>
      {open && children}
    </dialog>
  )
}
