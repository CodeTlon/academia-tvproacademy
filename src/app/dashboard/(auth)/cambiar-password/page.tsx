import Image from 'next/image'
import { guardPage } from '@/lib/session'
import CambiarPasswordForm from './CambiarPasswordForm'

export default async function CambiarPasswordPage() {
  const user = await guardPage('dashboard', { allowForced: true })
  const forced = user.mustChangePassword

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
          TVPRO<span className="text-gold">ACADEMY</span>
        </span>
      </div>
      <CambiarPasswordForm forced={forced} />
    </div>
  )
}
