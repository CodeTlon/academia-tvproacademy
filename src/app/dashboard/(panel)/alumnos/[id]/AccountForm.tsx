'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { AlertCircle, Copy, Check, KeyRound } from 'lucide-react'
import { useRef, useState } from 'react'
import { createStudentAccountAction, resetStudentPasswordAction, type AccountState } from '@/actions/students'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import type { Student } from '@/lib/students'

function waLink(phone: string | null, email: string, tempPassword: string) {
  const digits = (phone ?? '').replace(/\D/g, '')
  const text = encodeURIComponent(
    `Hola! Ya tenés acceso al portal de TV Pro Academy.\n\nEntrá en: ${typeof window !== 'undefined' ? window.location.origin : ''}/login\nEmail: ${email}\nContraseña temporal: ${tempPassword}\n\nTe va a pedir cambiarla la primera vez que entres.`,
  )
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`
}

function CopyField({ label, value, ariaLabel }: { label: string; value: string; ariaLabel: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <p className="text-[11px] font-semibold text-on-gold/70 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-white border border-gold/40 rounded-md px-3 py-2 text-sm font-mono text-zinc-900 truncate">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="p-2.5 rounded-md border border-gold/40 bg-white text-on-gold hover:bg-gold/10 transition-colors flex-shrink-0"
          aria-label={ariaLabel}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}

function RevealCredentials({ email, tempPassword, phone }: { email: string; tempPassword: string; phone: string | null }) {
  return (
    <div className="bg-gold/10 border border-gold/40 rounded-lg p-4 space-y-3">
      <p className="text-xs font-bold text-on-gold uppercase tracking-wider">
        Guardá estos datos ahora — la contraseña no se vuelve a mostrar
      </p>
      <CopyField label="Usuario" value={email} ariaLabel="Copiar usuario" />
      <CopyField label="Contraseña temporal" value={tempPassword} ariaLabel="Copiar contraseña" />
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
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-700 border border-zinc-200 px-4 py-2.5 rounded-md font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-60"
      >
        <KeyRound size={14} /> {pending ? 'Generando…' : 'Regenerar contraseña'}
      </button>
      <ConfirmDialog
        open={open}
        title="Regenerar contraseña"
        message="Esto invalida la contraseña actual del alumno al toque, aunque ya la haya cambiado él mismo — va a necesitar la nueva que se genera acá para volver a entrar."
        confirmLabel="Regenerar"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          buttonRef.current?.form?.requestSubmit()
        }}
      />
    </>
  )
}

export default function AccountForm({ student }: { student: Student }) {
  const [createState, createAction] = useActionState<AccountState, FormData>(createStudentAccountAction, undefined)
  const [resetState, resetAction] = useActionState<AccountState, FormData>(resetStudentPasswordAction, undefined)

  // La contraseña recién generada vive en el estado local de la action que la
  // creó (create o reset) — no en `student`, que se re-renderiza por
  // `revalidatePath` apenas se crea la cuenta y haría desaparecer el aviso
  // antes de que el admin llegue a verlo si se lo ata a `student.user_id`.
  const revealed = createState?.tempPassword && createState.email
    ? createState
    : resetState?.tempPassword && resetState.email
      ? resetState
      : null
  const hasAccount = Boolean(student.user_id) || Boolean(createState?.tempPassword)
  const email = student.email ?? createState?.email

  if (hasAccount) {
    return (
      <div className="space-y-4">
        {!revealed && (
          <p className="text-sm text-zinc-600">
            Acceso creado — <span className="font-semibold text-zinc-900">{email}</span>
          </p>
        )}
        {resetState?.error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{resetState.error}</p>
          </div>
        )}
        {revealed && (
          <RevealCredentials email={revealed.email!} tempPassword={revealed.tempPassword!} phone={student.phone} />
        )}
        {student.user_id && (
          <form action={resetAction}>
            <input type="hidden" name="student_id" value={student.id} />
            <input type="hidden" name="user_id" value={student.user_id} />
            <ResetSubmitButton />
          </form>
        )}
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
      <p className="text-sm text-zinc-500">
        Se genera un usuario y una contraseña temporal — no hace falta pedirle el email al alumno, se comparte por WhatsApp.
      </p>
      <form action={createAction}>
        <input type="hidden" name="student_id" value={student.id} />
        <input type="hidden" name="name" value={student.name} />
        <CreateSubmitButton />
      </form>
    </div>
  )
}
