'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import SavedToast from '@/components/dashboard/SavedToast'
import {
  LayoutDashboard, LogOut, ChevronRight, Menu, X,
  Sparkles, Users2, Dumbbell, MapPinned, Building2, Newspaper,
} from 'lucide-react'

// Etapas siguientes van agregando secciones acá (Alumnos, Agenda, Usuarios…)
// a medida que existen — sin links muertos mientras tanto.
const navSections = [
  {
    label: 'Panel',
    links: [
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Contenido',
    links: [
      { href: '/dashboard/contenido/hero', label: 'Hero', icon: Sparkles },
      { href: '/dashboard/contenido/nosotros', label: 'Nosotros', icon: Users2 },
      { href: '/dashboard/contenido/metodologia', label: 'Metodología', icon: Dumbbell },
      { href: '/dashboard/contenido/instalaciones', label: 'Instalaciones', icon: MapPinned },
      { href: '/dashboard/contenido/negocio', label: 'Negocio y contacto', icon: Building2 },
    ],
  },
  {
    label: 'Blog',
    links: [
      { href: '/dashboard/blog', label: 'Artículos', icon: Newspaper },
    ],
  },
]

function SidebarLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-gold/20 text-gold-dark'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto flex-shrink-0 opacity-60" />}
    </Link>
  )
}

export default function DashboardPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="fixed inset-0 z-[100] flex bg-zinc-100 overflow-hidden">
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>

      {navOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 w-72 max-w-[85vw] flex-shrink-0 bg-slate-900 flex flex-col overflow-hidden transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 py-5 border-b border-slate-800 flex items-start justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-mark.webp"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain flex-shrink-0"
              sizes="36px"
            />
            <span className="text-sm font-bold text-slate-100 leading-tight">
              TV Pro
              <br />
              Academy
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-100 p-1 -mr-1 -mt-1"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-4 pt-2">
          Panel de administración
        </p>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <SidebarLink key={link.href} {...link} onNavigate={() => setNavOpen(false)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div
          className="px-3 py-4 border-t border-slate-800"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              <LogOut size={16} className="flex-shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header
          className="h-14 flex-shrink-0 bg-white border-b border-zinc-200 flex items-center px-4 sm:px-6 gap-3"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
        >
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 p-1 -ml-1"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">
              TV Pro Academy
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:inline"
          >
            Ver sitio →
          </a>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
