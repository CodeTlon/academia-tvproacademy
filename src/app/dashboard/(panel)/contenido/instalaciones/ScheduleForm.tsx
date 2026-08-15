'use client'

import { useActionState } from 'react'
import { updateSiteSettings } from '@/actions/settings'
import { ListField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { ScheduleSlot } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'schedule')

const SCHEDULE_FIELDS = [
  { name: 'day', placeholder: 'Días (ej: Lunes a Viernes)' },
  { name: 'hours', placeholder: 'Horario (ej: 16:00 – 21:00)' },
]

export default function ScheduleForm({ items }: { items: ScheduleSlot[] }) {
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

      <ListField label="Horarios" name="schedule" fields={SCHEDULE_FIELDS} defaultValue={items} addLabel="Agregar franja" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
