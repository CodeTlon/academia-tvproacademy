'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/actions/settings'
import { TextField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { BusinessSettings } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'business')

export default function NegocioForm({ settings }: { settings: BusinessSettings }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nombre (marca)" name="name" defaultValue={settings.name} placeholder="TVPRO ACADEMY" />
        <TextField
          label="Nombre para mostrar"
          name="displayName"
          defaultValue={settings.displayName}
          placeholder="TV Pro Academy"
        />
      </div>

      <TextField
        label="Tagline"
        name="tagline"
        defaultValue={settings.tagline}
        placeholder="Entrenamiento específico para jugadores que buscan dar el salto de calidad."
        hint="Frase corta usada en el footer."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Teléfono" name="phone" defaultValue={settings.phone} placeholder="+3516577504" />
        <TextField
          label="WhatsApp"
          name="whatsapp"
          defaultValue={settings.whatsapp}
          placeholder="5493516577504"
          hint="Solo números, con código de país. Se usa para los links de WhatsApp."
        />
      </div>

      <TextField label="Email" name="email" type="email" defaultValue={settings.email} placeholder="hola@tvproacademy.com" />
      <TextField label="Dirección" name="address" defaultValue={settings.address} placeholder="Benito Soria esq. Belgrano, Barrio Vélez Sarsfield, Córdoba" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
