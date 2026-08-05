'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Mismo estilo que `fieldInput` de Field.tsx, con lugar a la derecha para el ojo. */
export const passwordInputClass =
  'w-full bg-zinc-50 border border-zinc-200 rounded-md pl-3 pr-11 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-dark transition-colors'

/**
 * Input de contraseña con botón ojo para mostrar/ocultar.
 * No controlado (el valor viaja al form por `name`), igual que el resto de los
 * campos del panel.
 */
export default function PasswordInput({
  id,
  name = 'password',
  required,
  minLength,
  placeholder = '••••••••',
  autoComplete,
  className = passwordInputClass,
}: {
  id?: string
  name?: string
  required?: boolean
  minLength?: number
  placeholder?: string
  autoComplete?: string
  className?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id ?? name}
        name={name}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-zinc-400 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
