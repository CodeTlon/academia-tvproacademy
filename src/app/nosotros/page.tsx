import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import About from '@/components/sections/About'
import { demoConfig } from '@/lib/demo-config'

export const metadata: Metadata = {
  title: `Nosotros | ${demoConfig.business.displayName}`,
  description: 'Conocé a Tomás Varela, fundador y entrenador de TVPRO ACADEMY, y la visión detrás de la academia.',
}

export default function NosotrosPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <About />
      </main>
      <Footer />
    </>
  )
}
