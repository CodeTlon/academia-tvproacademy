import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import PageHeader from '@/components/dashboard/PageHeader'
import NegocioForm from './NegocioForm'

export default async function NegocioContentPage() {
  const settings = await getSiteSettings()
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al panel
      </Link>
      <PageHeader title="Negocio y contacto" description="Datos de la academia usados en todo el sitio: footer, sección de contacto y links de WhatsApp." />
      <NegocioForm settings={settings.business} />
    </div>
  )
}
