'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/actions/settings'
import { StringList } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'facilities')

export default function FacilitiesForm({ items }: { items: string[] }) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      <InlineSavedBanner trigger={state} />
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <StringList label="Instalaciones" name="facilities" defaultValue={items} placeholder="Vestuarios" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
