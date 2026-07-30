import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import PageHeader from '@/components/dashboard/PageHeader'
import ServicesForm from './ServicesForm'
import ProcessForm from './ProcessForm'

export default async function MetodologiaContentPage() {
  const settings = await getSiteSettings()
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al panel
      </Link>
      <PageHeader title="Metodología" description="Drills de entrenamiento y pasos del proceso (/entrenamiento)." />

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Drills</h2>
        <ServicesForm items={settings.services} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Cómo trabajamos</h2>
        <ProcessForm items={settings.process} />
      </div>
    </div>
  )
}
