'use client'

import { useActionState } from 'react'
import { updateSiteSettings } from '@/actions/settings'
import { ListField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { ProcessStep } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'process')

const PROCESS_FIELDS = [
  { name: 'title', placeholder: 'Título (ej: Evaluación Inicial)' },
  { name: 'description', placeholder: 'Descripción', type: 'textarea' as const },
]

export default function ProcessForm({ items }: { items: ProcessStep[] }) {
  const [state, formAction] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      <InlineSavedBanner trigger={state} />
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <ListField label="Pasos" name="process" fields={PROCESS_FIELDS} defaultValue={items} addLabel="Agregar paso" hint="Se numeran automáticamente en el orden que queden acá." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
