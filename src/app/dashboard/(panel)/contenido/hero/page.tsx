import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import PageHeader from '@/components/dashboard/PageHeader'
import HeroForm from './HeroForm'

export default async function HeroContentPage() {
  const settings = await getSiteSettings()
  return (
    <div className="max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver al panel
      </Link>
      <PageHeader title="Hero" description="Encabezado principal de la home, arriba de todo." />
      <HeroForm settings={settings.hero} />
    </div>
  )
}
