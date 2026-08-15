'use client'

import { useActionState } from 'react'
import { updateSiteSettings } from '@/actions/settings'
import { TextField, StringList, VideoUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle } from 'lucide-react'
import type { HeroSettings } from '@/lib/site-settings'

const action = updateSiteSettings.bind(null, 'hero')

export default function HeroForm({ settings }: { settings: HeroSettings }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Título" name="title" defaultValue={settings.title} placeholder="Entrená como" />
        <TextField
          label="Título (resaltado en dorado)"
          name="titleAccent"
          defaultValue={settings.titleAccent}
          placeholder="un profesional"
        />
      </div>

      <StringList
        label="Bullets"
        name="bullets"
        defaultValue={settings.bullets}
        placeholder="Técnica individual"
        hint="Se muestran con un check dorado debajo del título."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VideoUpload
          label="Video de fondo (desktop)"
          name="videoDesktop"
          defaultValue={settings.videoDesktop}
          folder="hero"
          hint="MP4 o MOV, hasta 25MB. Se ve en pantallas de 768px o más."
        />
        <VideoUpload
          label="Video de fondo (mobile)"
          name="videoMobile"
          defaultValue={settings.videoMobile}
          folder="hero"
          hint="MP4 o MOV, hasta 25MB. Exportalo liviano: 1080p o menos, unos segundos en loop alcanza."
        />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
