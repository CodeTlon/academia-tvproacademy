'use client'

import { useActionState } from 'react'
import { updateSiteSettings } from '@/actions/settings'
import { TextField, TextArea, ListField, ImageUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { AboutSettings } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'about')

const VALUE_FIELDS = [
  { name: 'icon', placeholder: 'Icono (nombre de lucide-react, ej: Target)' },
  { name: 'title', placeholder: 'Título (ej: Disciplina)' },
  { name: 'description', placeholder: 'Descripción', type: 'textarea' as const },
]

export default function NosotrosForm({ settings }: { settings: AboutSettings }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Eyebrow" name="eyebrow" defaultValue={settings.eyebrow} placeholder="Conocé a" />
        <TextField label="Nombre del fundador" name="founderName" defaultValue={settings.founderName} placeholder="Tomás Varela" />
        <TextField label="Rol" name="role" defaultValue={settings.role} placeholder="Fundador y Entrenador" />
      </div>

      <TextArea label="Texto" name="body" defaultValue={settings.body} rows={5} placeholder="Sumate a TVPro y empezá a mejorar tu juego..." />

      <TextField label="Badge" name="badge" defaultValue={settings.badge} placeholder="Experiencia Profesional" />

      <ImageUpload
        label="Foto del fundador"
        name="image"
        defaultValue={settings.image}
        folder="nosotros"
        hint="Se muestra en la sección Nosotros del sitio."
        previewAspect="4 / 5"
      />

      <ListField
        label="Valores"
        name="values"
        fields={VALUE_FIELDS}
        defaultValue={settings.values}
        addLabel="Agregar valor"
        hint="Nombres de íconos válidos en lucide.dev/icons — si el nombre no existe se usa un ícono genérico."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
