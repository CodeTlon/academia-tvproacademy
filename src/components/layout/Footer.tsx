import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'
import { demoConfig } from '@/lib/demo-config'

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Entrenamiento', href: '/entrenamiento' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
]

export default function Footer() {
  const { business } = demoConfig

  return (
    <footer className="w-full bg-[#030f1e] border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#f5bf00]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="italic font-black uppercase tracking-tighter text-xl text-white">
              TVPRO<span className="text-[#f5bf00]">ACADEMY</span>
            </span>
            <Image src="/images/logo-mark.webp" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
          </Link>
          <p className="text-sm text-[#a9b7cc] mt-4 leading-relaxed max-w-xs">
            {business.tagline}
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5bf00] mb-1">Navegación</span>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[#a9b7cc] hover:text-[#f5bf00] transition-colors w-fit">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5bf00] mb-1">Contacto</span>
          <div className="flex items-start gap-2 text-sm text-[#a9b7cc]">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#f5bf00]" />
            {business.address}
          </div>
          <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-sm text-[#a9b7cc] hover:text-[#f5bf00] transition-colors w-fit">
            <Phone size={16} className="flex-shrink-0 text-[#f5bf00]" />
            {business.phone}
          </a>
          <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-sm text-[#a9b7cc] hover:text-[#f5bf00] transition-colors w-fit">
            <Mail size={16} className="flex-shrink-0 text-[#f5bf00]" />
            {business.email}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#a9b7cc]">
          <span>© {new Date().getFullYear()} {business.name}. Elevating Performance.</span>
          <a
            href="https://codetlon.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f5bf00] transition-colors"
          >
            Diseño y desarrollo por CodeTlon
          </a>
        </div>
      </div>
    </footer>
  )
}
