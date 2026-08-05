'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'

/**
 * `clearEmail` le dice al form si conviene vaciar el campo email al fallar el
 * login: solo cuando ese email no existe. Si la contraseña estaba mal, el email
 * queda como está para poder reintentar sin retipearlo.
 * El texto de `error` es idéntico en ambos casos — no filtra si el mail existe.
 */
export type AuthState = { error?: string; clearEmail?: boolean } | undefined

/**
 * ¿Existe un usuario con ese email en Supabase Auth? Requiere service_role.
 * Devuelve `null` si no se pudo determinar (sin service key, error de red, etc.)
 * para que quien llame elija el camino conservador.
 *
 * No hay tabla propia que espeje los emails de auth.users (`students` no guarda
 * email), así que se pagina el admin API. Son los usuarios del panel: un puñado.
 */
async function emailExists(email: string): Promise<boolean | null> {
  const target = email.toLowerCase()
  const perPage = 1000
  const maxPages = 10

  try {
    const admin = createSupabaseAdminClient()
    for (let page = 1; page <= maxPages; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
      if (error) {
        console.error('emailExists error:', error.message)
        return null
      }
      if (data.users.some((u) => u.email?.toLowerCase() === target)) return true
      if (data.users.length < perPage) return false
    }
    return null
  } catch (err) {
    console.error('emailExists error:', err)
    return null
  }
}

/**
 * Iniciar sesión con email y contraseña.
 * En caso de éxito redirige al dashboard (no retorna).
 */
export async function signIn(prevState: unknown, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const rawNext  = String(formData.get('next') ?? '/dashboard')
  // Solo rutas internas del panel: nunca redirigir a un host externo.
  const next     = rawNext.startsWith('/dashboard') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (!email || !password) {
    return { error: 'Completá todos los campos.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('signIn error:', error.message)
    // Mismo mensaje exista o no el email; lo único que cambia es si el form
    // limpia el campo (solo si el email directamente no existe).
    return {
      error: 'Credenciales incorrectas. Verificá tu email y contraseña.',
      clearEmail: (await emailExists(email)) === false,
    }
  }

  redirect(next)
}

/**
 * Cerrar sesión y redirigir al login.
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/dashboard/login')
}

/**
 * Cambia la contraseña del usuario logueado (mismo form sirve para el gate
 * obligatorio del primer login y para el cambio voluntario desde el panel).
 * Limpia `must_change_password` si estaba en true.
 */
export async function changePassword(prevState: unknown, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!password || !confirmPassword) return { error: 'Completá todos los campos.' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password,
    data: { must_change_password: false },
  })

  if (error) return { error: friendlyError(error, 'No se pudo cambiar la contraseña. Intentá de nuevo.') }

  redirect('/dashboard')
}

/** Lanza si no hay sesión — defensa en profundidad además del middleware, para usar al tope de cada Server Action. */
export async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user
}
