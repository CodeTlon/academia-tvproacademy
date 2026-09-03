import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import About from '@/components/sections/About'
import PublicExtras from '@/components/layout/PublicExtras'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Nosotros | ${siteConfig.business.displayName}`,
  description: 'Conocé a Tomás Varela, fundador y entrenador de TVPRO ACADEMY, y la visión detrás de la academia de fútbol en Córdoba.',
}

export default function NosotrosPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <About />
        <div className="text-center py-16 px-5 bg-[#071424] border-t border-white/10">
          <p className="text-[#d2c5ab] mb-4">¿Querés ver cómo es la metodología de entrenamiento?</p>
          <div className="flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-wide text-[#f5bf00]">
            <Link href="/entrenamiento" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Ver Entrenamiento</Link>
            <Link href="/contacto" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Ir a Contacto</Link>
          </div>
        </div>
      </main>
      <PublicExtras />
      <Footer />
    </>
  )
}
