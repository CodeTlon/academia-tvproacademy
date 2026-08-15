import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import CambiarPasswordForm from '@/app/dashboard/(auth)/cambiar-password/CambiarPasswordForm'

export default async function PortalCambiarPasswordPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const forced = Boolean(user?.user_metadata?.must_change_password)

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Image
          src="/images/logo-mark.webp"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          sizes="48px"
        />
        <span className="italic font-black uppercase tracking-tighter text-xl text-zinc-900">
          TVPRO<span className="text-[#f5bf00]">ACADEMY</span>
        </span>
      </div>
      <CambiarPasswordForm forced={forced} backHref="/portal" />
    </div>
  )
}
