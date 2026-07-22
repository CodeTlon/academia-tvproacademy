import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import QuickLinks from '@/components/sections/QuickLinks'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickLinks />
      </main>
      <Footer />
    </>
  )
}
