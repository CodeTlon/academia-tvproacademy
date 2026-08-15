import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import CambiarPasswordForm from '@/app/dashboard/(auth)/cambiar-password/CambiarPasswordForm'

export default async function PortalCambiarPasswordPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const forced = Boolean(user?.user_metadata?.must_change_password)

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <Image
          src="/images/logo-mark.webp"
          alt="TV Pro Academy"
          width={160}
          height={50}
          className="h-12 w-auto object-contain"
          sizes="160px"
        />
      </div>
      <CambiarPasswordForm forced={forced} backHref="/portal" />
    </div>
  )
}
