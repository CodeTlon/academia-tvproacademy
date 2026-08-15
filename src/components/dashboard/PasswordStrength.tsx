'use client'

// Adaptado de diseños/componentes/password-strength.tsx (21st.dev) — reglas y
// labels traducidos, largo mínimo bajado a 8 (coincide con la contraseña
// temporal que genera createStudentAccountAction), variantes dark: quitadas
// (el sitio no tiene modo oscuro).

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const
const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const
const INSTANT = { duration: 0 } as const

const COMMON = /^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i
const RUN = /(.)\1{3,}/
const RUN_UP = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i
const SYMBOL = /[!-/:-@[-`{-~]/

type PasswordRule = { id: string; label: string; test: (value: string) => boolean }
type EvaluatedRule = PasswordRule & { met: boolean }

const rules: readonly PasswordRule[] = [
  { id: 'length', label: '8 caracteres o más', test: (v) => v.length >= 8 },
  { id: 'case', label: 'Mayúsculas y minúsculas', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'digit', label: 'Un número', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'Un símbolo', test: (v) => SYMBOL.test(v) },
]

const labels = ['Vacía', 'Débil', 'Regular', 'Buena', 'Fuerte'] as const

function usePasswordStrength(value: string) {
  const state = useMemo(() => {
    const evaluated: EvaluatedRule[] = rules.map((rule) => ({ ...rule, met: rule.test(value) }))
    const passed = evaluated.reduce((n, r) => n + (r.met ? 1 : 0), 0)
    const guessable = value.length > 0 && (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value))
    const score = value.length === 0 ? 0 : guessable ? 1 : Math.min(rules.length, Math.max(1, passed))
    const label = labels[Math.min(score, labels.length - 1)] ?? ''
    const unmet = evaluated.filter((r) => !r.met)
    const announcement =
      value.length === 0
        ? ''
        : [
            `Fuerza de la contraseña: ${label.toLowerCase()}.`,
            guessable ? 'Es un patrón fácil de adivinar.' : '',
            unmet.length === 0 ? 'Cumple todos los requisitos.' : `Todavía falta: ${unmet.map((r) => r.label.toLowerCase()).join(', ')}.`,
          ].filter(Boolean).join(' ')
    return { score, max: rules.length, label, rules: evaluated, guessable, announcement }
  }, [value])

  const [settled, setSettled] = useState('')
  useEffect(() => {
    if (state.announcement === '') {
      setSettled('')
      return
    }
    const id = setTimeout(() => setSettled(state.announcement), 700)
    return () => clearTimeout(id)
  }, [state.announcement])

  return { ...state, announcement: settled }
}

const TONES = {
  none: { bar: 'bg-zinc-200', text: 'text-zinc-500' },
  danger: { bar: 'bg-red-500', text: 'text-red-600' },
  caution: { bar: 'bg-amber-500', text: 'text-amber-600' },
  safe: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
} as const

function toneFor(score: number, max: number) {
  if (score === 0) return TONES.none
  const ratio = score / max
  if (ratio <= 0.34) return TONES.danger
  if (ratio <= 0.67) return TONES.caution
  return TONES.safe
}

export default function PasswordStrength({ value, showRules = true, className = '' }: { value: string; showRules?: boolean; className?: string }) {
  const { score, max, label, rules: evaluated, guessable, announcement } = usePasswordStrength(value)
  const reduced = useReducedMotion()
  const tone = toneFor(score, max)
  // Evita el flash de "Vacía"/barras en 0 durante el primer render en el servidor.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || value.length === 0) return null

  return (
    <div className={`w-full ${className}`}>
      <div
        role="meter"
        aria-label="Fuerza de la contraseña"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
        aria-valuetext={label}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: max }, (_, i) => (
          <div key={i} className="relative h-1.5 overflow-hidden rounded-[2px] bg-zinc-200">
            <motion.span
              className={`absolute inset-0 origin-left rounded-[2px] transition-colors duration-200 ${tone.bar}`}
              initial={false}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={reduced ? INSTANT : { ...CELL, delay: i < score ? i * 0.03 : 0 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex h-5 items-center justify-between gap-3">
        <span className={`text-[12.5px] font-semibold leading-5 ${tone.text}`}>{label}</span>
        {guessable && (
          <motion.span
            aria-hidden
            className="whitespace-nowrap text-[11.5px] leading-5 text-amber-600"
            initial={false}
            animate={{ opacity: guessable ? 1 : 0 }}
            transition={reduced ? INSTANT : CROSSFADE}
          >
            Fácil de adivinar
          </motion.span>
        )}
      </div>

      {showRules && (
        <ul className="mt-3 grid gap-1.5">
          {evaluated.map((rule) => (
            <li key={rule.id} className="flex items-center gap-2">
              <span className="relative grid size-[14px] shrink-0 place-items-center rounded-[4px] border border-zinc-200 text-white">
                <motion.span
                  className="absolute inset-0 rounded-[3px] bg-emerald-500"
                  initial={false}
                  animate={{ opacity: rule.met ? 1 : 0 }}
                  transition={reduced ? INSTANT : CROSSFADE}
                />
                <motion.svg
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className="relative size-[9px]"
                  initial={false}
                  animate={{ opacity: rule.met ? 1 : 0, scale: rule.met ? 1 : 0.6 }}
                  transition={reduced ? INSTANT : CELL}
                >
                  <path d="M2 6.2 4.7 8.9 10 3.3" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </span>
              <span className={`text-[12.5px] leading-5 transition-colors duration-200 ${rule.met ? 'text-zinc-700' : 'text-zinc-500'}`}>
                {rule.label}
              </span>
              <span className="sr-only">{rule.met ? 'cumplida' : 'falta'}</span>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="sr-only">{announcement}</p>
    </div>
  )
}
