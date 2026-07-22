import Link from 'next/link'
import { Dumbbell, Users, Newspaper, MessageCircle, ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'

const links = [
  { href: '/entrenamiento', icon: Dumbbell, title: 'Entrenamiento', desc: 'Nuestra metodología de trabajo, drill por drill.' },
  { href: '/nosotros', icon: Users, title: 'Nosotros', desc: 'Conocé al fundador y la visión de la academia.' },
  { href: '/blog', icon: Newspaper, title: 'Blog', desc: 'Artículos sobre técnica, agilidad y rendimiento.' },
  { href: '/contacto', icon: MessageCircle, title: 'Contacto', desc: 'Instalaciones, ubicación y reserva de turnos.' },
]

export default function QuickLinks() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-[#030f1e]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {links.map(({ href, icon: Icon, title, desc }, i) => (
          <Reveal key={href} delay={i * 100}>
            <Link
              href={href}
              className="group block h-full bg-[#071424] border border-white/10 rounded-xl p-8 hover:border-[#f5bf00] hover:scale-[1.02] transition-all duration-500"
            >
              <Icon size={28} className="text-[#f5bf00] mb-4" />
              <h3 className="font-bold uppercase text-lg text-white mb-2">{title}</h3>
              <p className="text-sm text-[#d2c5ab] mb-4">{desc}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#f5bf00]">
                Ver más
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
