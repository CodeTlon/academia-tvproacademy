import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

// Valida la sesión en el servidor (cookie firmada + fila en `session`). El middleware solo hace un redirect
// optimista: la seguridad real está acá, en cada página y Server Action.
export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getUser>>>

export const isStudent = (u: { role?: string | null }) => u.role === 'student'
export const homeFor = (u: { role?: string | null }) => (isStudent(u) ? '/portal' : '/dashboard')

/** Para Server Actions: lanza si no hay sesión. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser()
  if (!user) throw new Error('No autenticado')
  return user
}

/** Para Server Actions del panel: cualquier cuenta que no sea de alumno. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (isStudent(user)) throw new Error('No autorizado')
  return user
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser()
  if (!isStudent(user)) throw new Error('No autorizado')
  return user
}

/**
 * Guardas de página (layouts): redirigen en vez de lanzar. Hacen lo que antes hacía el middleware de Supabase:
 * sin sesión al login, cada rol a lo suyo y contraseña temporal sin cambiar al formulario de cambio.
 */
export async function guardPage(area: 'dashboard' | 'portal', opts: { allowForced?: boolean } = {}): Promise<SessionUser> {
  const user = await getUser()
  if (!user) redirect('/login')
  if (homeFor(user) !== `/${area}`) redirect(homeFor(user))
  if (user.mustChangePassword && !opts.allowForced) redirect(`/${area}/cambiar-password`)
  return user
}
