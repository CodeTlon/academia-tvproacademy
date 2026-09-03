import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Services from '@/components/sections/Services'
import FAQ from '@/components/sections/FAQ'
import PublicExtras from '@/components/layout/PublicExtras'
import TLDRBox from '@/components/ui/TLDRBox'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Entrenamiento de Fútbol en Córdoba | ${siteConfig.business.displayName}`,
  description: 'Nuestra metodología de entrenamiento de fútbol: footwork, control de balón y toma de decisiones, con evaluación inicial y plan personalizado por jugador.',
}

export default function EntrenamientoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-4 px-5 md:px-10">
        <div className="max-w-3xl mx-auto mb-6">
          <p className="eyebrow">Metodología</p>
          <p className="section-title !text-white">Así entrenamos en TVPRO ACADEMY</p>
          <p className="text-lg text-[#d2c5ab] leading-relaxed mb-6">
            Si buscás un entrenamiento de fútbol en Córdoba enfocado en dar el salto de calidad —no clases genéricas—,
            así es como trabajamos: drills de alta intensidad en footwork, control de balón y toma de decisiones,
            con seguimiento sesión a sesión.
          </p>
          <a
            href={`https://wa.me/${siteConfig.business.whatsapp}`}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#f5bf00] hover:gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md"
          >
            Reservá tu turno
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="max-w-3xl mx-auto">
          <TLDRBox
            points={[
              'Evaluación inicial del nivel técnico, físico y mental en la primera sesión.',
              'Plan de entrenamiento personalizado según posición y objetivos del jugador.',
              'Tres ejes de trabajo: footwork, control de balón y toma de decisiones.',
              'Seguimiento continuo: se mide el avance y se ajusta la exigencia sesión a sesión.',
            ]}
          />
        </div>
      </main>
      <Services />
      <FAQ />
      <div className="text-center py-16 px-5 bg-[#030f1e] border-t border-white/10">
        <p className="text-[#d2c5ab] mb-4">¿Querés conocer al fundador o coordinar tu turno?</p>
        <div className="flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-wide text-[#f5bf00]">
          <Link href="/nosotros" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Conocé Nosotros</Link>
          <Link href="/contacto" className="hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] rounded-md">Ir a Contacto</Link>
        </div>
      </div>
      <PublicExtras />
      <Footer />
    </>
  )
}
