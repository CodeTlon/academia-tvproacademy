'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, Save } from 'lucide-react'

export default function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-gold text-on-gold px-6 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Save size={16} />
      )}
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}
