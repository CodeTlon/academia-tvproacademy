import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Services from '@/components/sections/Services'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Entrenamiento | ${siteConfig.business.displayName}`,
  description: 'Nuestra metodología de entrenamiento: footwork, control de balón y toma de decisiones.',
}

export default function EntrenamientoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Services />
      </main>
      <Footer />
    </>
  )
}
