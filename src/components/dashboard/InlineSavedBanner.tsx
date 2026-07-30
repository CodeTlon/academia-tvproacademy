'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle } from 'lucide-react'

/**
 * Banner de éxito para forms que no redirigen (site_settings, posts) — el
 * form queda en la misma página, así que necesita su propio timeout para no
 * quedar fijo en pantalla. `trigger` es el objeto que devuelve useFormState:
 * una referencia nueva en cada submit, por eso el efecto se dispara de nuevo
 * aunque `success` sea true las dos veces.
 */
export default function InlineSavedBanner({ trigger }: { trigger: { success?: boolean } | null | undefined }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trigger?.success) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(t)
  }, [trigger])

  useEffect(() => {
    if (show) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [show])

  if (!show) return null

  return (
    <div ref={ref} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      <p className="text-green-700 text-sm font-medium">Cambios guardados correctamente.</p>
    </div>
  )
}
