import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Contact from '@/components/sections/Contact'
import PublicExtras from '@/components/layout/PublicExtras'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Contacto | ${siteConfig.business.displayName}`,
  description: 'Instalaciones, ubicación y reserva de turnos en TVPRO ACADEMY, academia de fútbol en Córdoba.',
}

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Contact />
        <div className="text-center py-16 px-5 bg-[#071424] border-t border-white/10">
          <p className="text-[#d2c5ab] mb-4">¿Todavía no conocés nuestra metodología de entrenamiento?</p>
          <div className="flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-wide text-[#f5bf00]">
            <Link href="/entrenamiento" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Ver Entrenamiento</Link>
            <Link href="/nosotros" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Conocé Nosotros</Link>
          </div>
        </div>
      </main>
      <PublicExtras />
      <Footer />
    </>
  )
}
