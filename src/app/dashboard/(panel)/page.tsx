import Link from 'next/link'
import { Sparkles, Users2, Dumbbell, MapPinned, Building2, Newspaper, ArrowRight } from 'lucide-react'

const links = [
  { href: '/dashboard/contenido/hero', label: 'Hero', desc: 'Título y bullets del encabezado principal.', icon: Sparkles },
  { href: '/dashboard/contenido/nosotros', label: 'Nosotros', desc: 'Fundador y valores de la academia.', icon: Users2 },
  { href: '/dashboard/contenido/metodologia', label: 'Metodología', desc: 'Drills de entrenamiento y proceso.', icon: Dumbbell },
  { href: '/dashboard/contenido/instalaciones', label: 'Instalaciones', desc: 'Qué ofrece el predio y horarios.', icon: MapPinned },
  { href: '/dashboard/contenido/negocio', label: 'Negocio y contacto', desc: 'Teléfono, WhatsApp, email y dirección.', icon: Building2 },
  { href: '/dashboard/blog', label: 'Blog', desc: 'Artículos publicados en el sitio.', icon: Newspaper },
]

export default function DashboardHomePage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Bienvenido al panel
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Administrá el contenido del sitio de TV Pro Academy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:border-gold-dark transition-colors"
          >
            <Icon size={22} className="text-gold-dark mb-3" />
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              {label}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </p>
            <p className="text-sm text-zinc-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
