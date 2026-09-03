import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Página no encontrada | ${siteConfig.business.displayName}`,
  description: 'La página que buscás no existe o cambió de dirección. Volvé al inicio de TVPRO ACADEMY.',
}

// Branded 404, patrón clonado de gc2/src/app/not-found.tsx: usa los tokens
// de siteConfig (no hardcodea colores propios) y ofrece un CTA claro de vuelta.
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-5 md:px-10 pt-32 pb-24 text-center">
        <div className="max-w-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#f5bf00] text-[#f5bf00] mb-8">
            <Dumbbell size={28} />
          </div>
          <p className="eyebrow">Error 404</p>
          <h1 className="font-black uppercase text-4xl md:text-6xl leading-[1.1] text-white mb-6">
            Esta jugada <br />
            <span className="text-[#f5bf00] italic">no está en la cancha</span>
          </h1>
          <p className="text-lg text-[#d2c5ab] leading-relaxed mb-10">
            La página que buscás no existe o cambió de dirección. Volvé al inicio y seguí explorando la metodología de entrenamiento.
          </p>
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-3 bg-[#f5bf00] text-[#241a00] font-bold uppercase tracking-wider text-base px-8 py-4 rounded-full shadow-[0_0_20px_rgba(245,191,0,0.4)] hover:shadow-[0_0_30px_rgba(245,191,0,0.6)] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071424]"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
