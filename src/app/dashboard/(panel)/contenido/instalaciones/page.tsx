import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import PageHeader from '@/components/dashboard/PageHeader'
import FacilitiesForm from './FacilitiesForm'
import ScheduleForm from './ScheduleForm'

export default async function InstalacionesContentPage() {
  const settings = await getSiteSettings()
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al panel
      </Link>
      <PageHeader title="Instalaciones y horarios" description="Sección de contacto (/contacto): qué ofrece el predio y cuándo se entrena." />

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Instalaciones</h2>
        <FacilitiesForm items={settings.facilities} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Horarios de entrenamiento</h2>
        <ScheduleForm items={settings.schedule} />
      </div>
    </div>
  )
}
