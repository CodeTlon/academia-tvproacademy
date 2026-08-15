'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { AlertCircle, Copy, Check, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { createStudentAccountAction, resetStudentPasswordAction, type AccountState } from '@/actions/students'
import { fieldInput, fieldLabel } from '@/components/dashboard/Field'
import type { Student } from '@/lib/students'

function waLink(phone: string | null, email: string, tempPassword: string) {
  const digits = (phone ?? '').replace(/\D/g, '')
  const text = encodeURIComponent(
    `Hola! Ya tenés acceso al portal de TV Pro Academy 🎉\n\nEntrá en: ${typeof window !== 'undefined' ? window.location.origin : ''}/portal/login\nEmail: ${email}\nContraseña temporal: ${tempPassword}\n\nTe va a pedir cambiarla la primera vez que entres.`,
  )
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`
}

function RevealCredentials({ email, tempPassword, phone }: { email: string; tempPassword: string; phone: string | null }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
        Guardá esta contraseña ahora — no se vuelve a mostrar
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-white border border-amber-200 rounded-md px-3 py-2 text-sm font-mono text-zinc-900">
          {tempPassword}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(tempPassword)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="p-2.5 rounded-md border border-amber-200 bg-white text-amber-700 hover:bg-amber-100 transition-colors"
          aria-label="Copiar contraseña"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <a
        href={waLink(phone, email, tempPassword)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95"
      >
        Enviar por WhatsApp
      </a>
    </div>
  )
}

function CreateSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gold text-on-gold px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60"
    >
      {pending ? 'Creando…' : 'Crear acceso'}
    </button>
  )
}

function ResetSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-md font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-60"
    >
      <KeyRound size={14} /> {pending ? 'Generando…' : 'Regenerar contraseña'}
    </button>
  )
}

export default function AccountForm({ student }: { student: Student }) {
  const [createState, createAction] = useFormState<AccountState, FormData>(createStudentAccountAction, undefined)
  const [resetState, resetAction] = useFormState<AccountState, FormData>(resetStudentPasswordAction, undefined)

  if (student.user_id) {
    const state = resetState
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">
          Acceso creado — <span className="font-semibold text-zinc-900">{student.email}</span>
        </p>
        {state?.error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}
        {state?.tempPassword && state.email && (
          <RevealCredentials email={state.email} tempPassword={state.tempPassword} phone={student.phone} />
        )}
        <form action={resetAction}>
          <input type="hidden" name="student_id" value={student.id} />
          <input type="hidden" name="user_id" value={student.user_id} />
          <ResetSubmitButton />
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {createState?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{createState.error}</p>
        </div>
      )}
      {createState?.tempPassword && createState.email ? (
        <RevealCredentials email={createState.email} tempPassword={createState.tempPassword} phone={student.phone} />
      ) : (
        <form action={createAction} className="flex items-end gap-2">
          <input type="hidden" name="student_id" value={student.id} />
          <div className="flex-1">
            <label htmlFor="email" className={fieldLabel}>Email del alumno</label>
            <input id="email" name="email" type="email" required placeholder="alumno@email.com" className={fieldInput} />
          </div>
          <CreateSubmitButton />
        </form>
      )}
    </div>
  )
}
