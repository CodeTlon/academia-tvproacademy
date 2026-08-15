'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Entrenamiento', href: '/entrenamiento' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
]

export default function NavbarClient({ panelHref }: { panelHref: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#071424]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="italic font-black uppercase tracking-tighter text-xl text-white">
              TVPRO<span className="text-[#f5bf00]">ACADEMY</span>
            </span>
            <Image src="/images/logo-mark.webp" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#d2c5ab] hover:text-[#f5bf00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={panelHref ?? '/login'}
              className="hidden lg:inline-flex items-center justify-center border-2 border-[#f5bf00] text-[#f5bf00] text-sm font-bold uppercase tracking-wider px-5 py-3 rounded-full hover:bg-[#f5bf00] hover:text-[#241a00] transition-colors"
            >
              {panelHref ? 'Mi panel' : 'Portal alumnos'}
            </Link>
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menú"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-white/10 bg-[#071424] transition-[max-height,opacity] duration-300 ease-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wider text-[#d2c5ab] py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={panelHref ?? '/login'}
            className="mt-2 inline-flex items-center justify-center border-2 border-[#f5bf00] text-[#f5bf00] text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full"
            onClick={() => setOpen(false)}
          >
            {panelHref ? 'Ir a mi panel' : 'Portal alumnos'}
          </Link>
        </div>
      </div>
    </header>
  )
}
