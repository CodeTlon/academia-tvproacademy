'use client'

import { useActionState } from 'react'
import { updateSiteSettings } from '@/actions/settings'
import { ListField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { ServiceItem } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'services')

const SERVICE_FIELDS = [
  { name: 'icon', placeholder: 'Icono (lucide-react, ej: Footprints)' },
  { name: 'tag', placeholder: 'Etiqueta (ej: Agility)' },
  { name: 'title', placeholder: 'Título (ej: Footwork)' },
  { name: 'description', placeholder: 'Descripción', type: 'textarea' as const },
  { name: 'image', placeholder: 'Imagen', type: 'image' as const, folder: 'metodologia' },
]

export default function ServicesForm({ items }: { items: ServiceItem[] }) {
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

      <ListField label="Drills" name="services" fields={SERVICE_FIELDS} defaultValue={items} addLabel="Agregar drill" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
