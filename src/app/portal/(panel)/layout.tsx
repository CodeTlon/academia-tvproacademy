import Image from 'next/image'
import Link from 'next/link'
import { LogOut, KeyRound } from 'lucide-react'
import { requireStudent, signOut } from '@/actions/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function PortalPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStudent()
  const supabase = await createSupabaseServerClient()
  const { data: student } = await supabase.from('students').select('name').eq('user_id', user.id).single()

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/portal" className="flex items-center gap-2.5">
            <Image src="/images/logo-mark.webp" alt="" width={32} height={32} className="h-8 w-8 object-contain" sizes="32px" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">{student?.name ?? 'Mi portal'}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">TV Pro Academy</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/portal/cambiar-password"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
              aria-label="Cambiar contraseña"
            >
              <KeyRound size={18} />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  )
}
