'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/db/schema'
import { friendlyError } from '@/lib/friendly-error'
import { homeFor, requireUser } from '@/lib/session'


/**
 * `clearEmail` le dice al form si conviene vaciar el campo email al fallar el
 * login: solo cuando ese email no existe. Si la contraseña estaba mal, el email
 * queda como está para poder reintentar sin retipearlo.
 * El texto de `error` es idéntico en ambos casos — no filtra si el mail existe.
 */
export type AuthState = { error?: string; clearEmail?: boolean } | undefined

async function emailExists(email: string): Promise<boolean | null> {
  try {
    const rows = await db.select({ id: userTable.id }).from(userTable).where(sql`lower(${userTable.email}) = ${email.toLowerCase()}`).limit(1)
    return rows.length > 0
  } catch (err) {
    console.error('emailExists error:', err)
    return null
  }
}

/**
 * Iniciar sesión con email y contraseña — sirve para admin y alumno por igual. El rol recién se sabe
 * después de autenticar, así que la redirección a `/dashboard` o `/portal` se resuelve acá.
 */
export async function login(prevState: unknown, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const rawNext = String(formData.get('next') ?? '')

  if (!email || !password) return { error: 'Completá todos los campos.' }

  let home: string
  try {
    const res = await auth.api.signInEmail({ body: { email, password }, headers: await headers() })
    home = homeFor(res.user as { role?: string | null })
  } catch (err) {
    console.error('login error:', err instanceof Error ? err.message : err)
    // Mismo mensaje exista o no el email; lo único que cambia es si el form limpia el campo.
    return {
      error: 'Credenciales incorrectas. Verificá tu email y contraseña.',
      clearEmail: (await emailExists(email)) === false,
    }
  }

  // Solo rutas internas del área que corresponde: nunca un host externo ni el panel de otro rol vía `?next=`.
  const next = rawNext.startsWith(home) && !rawNext.startsWith('//') ? rawNext : home
  redirect(next)
}

/** Cerrar sesión. El login es único, así que siempre vuelve a `/login`. */
export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() })
  redirect('/login')
}

/**
 * Cambia la contraseña del usuario logueado (sirve para el gate obligatorio del primer login y para el cambio
 * voluntario). Limpia `mustChangePassword` y redirige según el rol.
 */
export async function changePassword(prevState: unknown, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!password || !confirmPassword) return { error: 'Completá todos los campos.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }

  let home: string
  try {
    const user = await requireUser()
    const ctx = await auth.$context
    await ctx.internalAdapter.updatePassword(user.id, await ctx.password.hash(password))
    await db.update(userTable).set({ mustChangePassword: false }).where(eq(userTable.id, user.id))
    home = homeFor(user)
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo cambiar la contraseña. Intentá de nuevo.') }
  }
  redirect(home)
}
