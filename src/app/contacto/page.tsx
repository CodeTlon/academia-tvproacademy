import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Contact from '@/components/sections/Contact'
import { demoConfig } from '@/lib/demo-config'

export const metadata: Metadata = {
  title: `Contacto | ${demoConfig.business.displayName}`,
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
