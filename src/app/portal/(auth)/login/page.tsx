'use client'

import { Suspense, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { studentSignIn } from '@/actions/auth'
import PasswordInput from '@/components/dashboard/PasswordInput'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gold text-on-gold py-3 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
    </button>
  )
}

// Solo rutas internas del portal: evita que un `?next=` manipulado mande a otro sitio.
function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/portal') || next.startsWith('//')) return '/portal'
  return next
}

function LoginForm() {
  const [state, action] = useFormState(studentSignIn, undefined)
  const next = safeNext(useSearchParams().get('next'))
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.clearEmail && emailRef.current) {
      emailRef.current.value = ''
      emailRef.current.focus()
    }
  }, [state])

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

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-100">
        <h1 className="text-xl font-bold text-zinc-900 mb-1">
          Portal de alumnos
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          Ingresá para ver tus clases y el estado de tu cuota.
        </p>

        {state?.error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-dark transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5"
            >
              Contraseña
            </label>
            <PasswordInput id="password" name="password" required autoComplete="current-password" />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}

export default function PortalLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
