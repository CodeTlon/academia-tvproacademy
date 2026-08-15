'use client'

import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Trash2, Loader2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export default function DeleteButton({
  confirmMessage = '¿Eliminar este registro? Esta acción no se puede deshacer.',
}: {
  confirmMessage?: string
}) {
  const { pending } = useFormStatus()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-md font-bold text-xs hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Trash2 size={13} />
        )}
        {pending ? 'Eliminando…' : 'Eliminar'}
      </button>
      <ConfirmDialog
        open={open}
        title="Eliminar registro"
        message={confirmMessage}
        confirmLabel="Eliminar"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          buttonRef.current?.form?.requestSubmit()
        }}
      />
    </>
  )
}
