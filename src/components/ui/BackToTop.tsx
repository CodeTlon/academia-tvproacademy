'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/** Botón flotante scroll-to-top. Aparece después de scrollear más de un viewport. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className={`fixed bottom-6 right-5 md:right-8 z-40 flex items-center justify-center w-11 h-11 rounded-full border border-white/10 bg-[#0e1b2c]/90 text-[#f5bf00] shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[#f5bf00] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5bf00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071424] ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  )
}
