import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Contact from '@/components/sections/Contact'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Contacto | ${siteConfig.business.displayName}`,
  description: 'Instalaciones, ubicación y reserva de turnos en TVPRO ACADEMY.',
}

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
    </>
  )
}
