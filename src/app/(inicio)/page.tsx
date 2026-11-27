import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import QuickLinks from '@/components/sections/QuickLinks'
import PublicExtras from '@/components/layout/PublicExtras'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Academia de Fútbol en Córdoba | ${siteConfig.business.displayName}`,
  description: 'Entrenamiento específico de fútbol en Córdoba para jugadores que buscan dar el salto de calidad: footwork, control de balón y toma de decisiones.',
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickLinks />
      </main>
      <PublicExtras />
      <Footer />
    </>
  )
}
