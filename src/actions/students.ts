'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { classAttendance, payments, students, session as sessionTable, user as userTable } from '@/db/schema'
import { friendlyError } from '@/lib/friendly-error'
import { todayStr } from '@/lib/date'
import { requireAdmin } from '@/lib/session'

export type StudentState = { error?: string } | undefined

function parseStudentForm(formData: FormData) {
  const price = String(formData.get('price_per_class') ?? '').trim()
  const frequency = Number(formData.get('weekly_frequency') ?? 2)
  return {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || null,
    // Clamp 1-7: coincide con el check constraint de la tabla (máx. una clase por día).
    weekly_frequency: Math.min(7, Math.max(1, Number.isFinite(frequency) ? frequency : 2)),
    price_per_class: price ? Number(price) : null,
  }
}

export async function createStudentAction(_prev: StudentState, formData: FormData): Promise<StudentState> {
  let newId: string
  try {
    await requireAdmin()
    // Sin `active`: los alumnos nuevos siempre arrancan activos (default de la tabla) — el
    // checkbox recién aparece en el form de edición, así que acá no viaja en el FormData.
    const data = parseStudentForm(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const [inserted] = await db.insert(students).values(data).returning({ id: students.id })

    revalidatePath('/dashboard/alumnos')
    newId = inserted.id
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo crear el alumno.') }
  }
  // Directo a la ficha del alumno recién creado: ahí está "Crear acceso" a un
  // click, sin tener que volver a buscarlo en la lista. `redirect()` va afuera
  // del try — tira su propia excepción de control de flujo, no un error real.
  redirect(`/dashboard/alumnos/${newId}`)
}

export async function updateStudentAction(id: string, _prev: StudentState, formData: FormData): Promise<StudentState> {
  try {
    await requireAdmin()
    const statusOverride = String(formData.get('status_override') ?? '')
    const data = {
      ...parseStudentForm(formData),
      active: formData.get('active') === 'on',
      status_override: (statusOverride === 'al_dia' || statusOverride === 'vencido' ? statusOverride : null) as 'al_dia' | 'vencido' | null,
    }
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    await db.update(students).set(data).where(eq(students.id, id))

    revalidatePath('/dashboard/alumnos')
    revalidatePath(`/dashboard/alumnos/${id}`)
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo guardar el alumno.') }
  }
  redirect('/dashboard/alumnos?saved=updated')
}

export async function deleteStudentAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireAdmin()

  // Si tenía acceso al portal, borrar también el usuario: si no, el email queda "tomado" para siempre y no se
  // puede reusar en un alumno nuevo. Sesiones y credenciales caen en cascada con el usuario.
  try {
    const [student] = await db.select({ user_id: students.user_id }).from(students).where(eq(students.id, id)).limit(1)
    if (student?.user_id) await db.delete(userTable).where(eq(userTable.id, student.user_id))
    await db.delete(students).where(eq(students.id, id))
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo eliminar el alumno.'))
  }
  revalidatePath('/dashboard/alumnos')
  redirect('/dashboard/alumnos?saved=deleted')
}

/** Marca una clase en `class_date` (default hoy), con hora opcional. Idempotente: si ya estaba
 * marcada, no hace nada. `excused` = clase programada que el alumno no pudo tomar: queda
 * registrada pero no descuenta del ciclo (ver classesTaken en lib/students.ts). */
export async function markAttendanceAction(formData: FormData) {
  const studentId = String(formData.get('student_id') ?? '')
  const classDate = String(formData.get('class_date') ?? '').trim() || todayStr()
  const classTime = String(formData.get('class_time') ?? '').trim() || null
  const excused = formData.get('excused') === 'true'
  const redirectTo = String(formData.get('redirect_to') ?? '/dashboard/alumnos')
  if (!studentId) return
  await requireAdmin()
  try {
    await db
      .insert(classAttendance)
      .values({ student_id: studentId, class_date: classDate, class_time: classTime, excused })
      .onConflictDoNothing({ target: [classAttendance.student_id, classAttendance.class_date] })
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo marcar la clase.'))
  }
  revalidatePath('/dashboard/alumnos')
  revalidatePath(`/dashboard/alumnos/${studentId}`)
  redirect(redirectTo)
}

export async function unmarkAttendanceAction(formData: FormData) {
  const attendanceId = String(formData.get('attendance_id') ?? '')
  const studentId = String(formData.get('student_id') ?? '')
  if (!attendanceId) return
  await requireAdmin()
  try {
    await db.delete(classAttendance).where(eq(classAttendance.id, attendanceId))
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo quitar la asistencia.'))
  }
  revalidatePath('/dashboard/alumnos')
  if (studentId) revalidatePath(`/dashboard/alumnos/${studentId}`)
}

/** Registra un pago en `paid_at` (default hoy) — mueve la fecha de vencimiento de la cuota
 * (1 mes desde el pago), pero NO reinicia el conteo de clases: eso es corrido e independiente
 * del pago (ver getStudentsWithStatus en lib/students.ts).
 * `amount`/`classes_qty` son opcionales: la acción rápida de la lista solo manda la fecha. */
export async function addPaymentAction(formData: FormData) {
  const studentId = String(formData.get('student_id') ?? '')
  const paidAt = String(formData.get('paid_at') ?? '').trim() || todayStr()
  const amountRaw = String(formData.get('amount') ?? '').trim()
  const qtyRaw = String(formData.get('classes_qty') ?? '').trim()
  const redirectTo = String(formData.get('redirect_to') ?? '/dashboard/alumnos')
  if (!studentId) return
  await requireAdmin()
  try {
    await db.insert(payments).values({
      student_id: studentId,
      paid_at: paidAt,
      amount: amountRaw ? Number(amountRaw) : null,
      classes_qty: qtyRaw ? Number(qtyRaw) : null,
    })
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo registrar el pago.'))
  }
  revalidatePath('/dashboard/alumnos')
  revalidatePath(`/dashboard/alumnos/${studentId}`)
  redirect(redirectTo)
}

export async function deletePaymentAction(formData: FormData) {
  const paymentId = String(formData.get('payment_id') ?? '')
  const studentId = String(formData.get('student_id') ?? '')
  if (!paymentId) return
  await requireAdmin()
  try {
    await db.delete(payments).where(eq(payments.id, paymentId))
  } catch (e) {
    throw new Error(friendlyError(e, 'No se pudo eliminar el pago.'))
  }
  revalidatePath('/dashboard/alumnos')
  if (studentId) revalidatePath(`/dashboard/alumnos/${studentId}`)
}

// ─── Acceso al portal — alta y reset de contraseña ──────────────────────────
// El admin genera una contraseña temporal y se la pasa al alumno por fuera
// del sistema (WhatsApp) — no hay envío de mail. Por eso las acciones no
// redirigen: devuelven la contraseña una sola vez para mostrarla en pantalla.
// El "email" del alumno tampoco es real: Supabase Auth exige uno como
// identificador único, pero nunca se le manda nada — se genera solo a partir
// del nombre bajo un dominio propio, así no hace falta pedírselo a cada uno.

export type AccountState = { error?: string; tempPassword?: string; email?: string } | undefined

const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin caracteres ambiguos (0/O, 1/I/l)

function generateTempPassword(length = 8) {
  const bytes = randomBytes(length)
  return Array.from(bytes, (b) => TEMP_PASSWORD_CHARS[b % TEMP_PASSWORD_CHARS.length]).join('')
}

function slugifyForEmail(name: string) {
  const slug = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return slug || 'alumno'
}

/** Crea la cuenta de portal de un alumno: usuario (rol `student`, contraseña temporal) + `email`/`user_id` en la fila del alumno.
 * El email es sintético (`nombre.apellido@tvproacademy.com.ar`, con un número al final si ya existe otro
 * alumno con el mismo nombre) — solo sirve de identificador de login, nunca se envía nada ahí. */
export async function createStudentAccountAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const studentId = String(formData.get('student_id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  if (!studentId || !name) return { error: 'Falta el alumno.' }

  await requireAdmin()
  const tempPassword = generateTempPassword()
  const base = slugifyForEmail(name)
  const ctx = await auth.$context

  let email = ''
  let userId: string | null = null
  try {
    for (let attempt = 0; attempt < 20; attempt++) {
      email = `${base}${attempt === 0 ? '' : attempt + 1}@tvproacademy.com.ar`
      if (await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: false })) continue
      // `role` y `mustChangePassword` los escribe solo el servidor: un alumno no puede auto-escalarse a admin.
      const created = await ctx.internalAdapter.createUser(
        { email, name, emailVerified: true, role: 'student', mustChangePassword: true },
        { method: 'email-password' },
      )
      await ctx.internalAdapter.linkAccount({
        userId: created.id,
        providerId: 'credential',
        accountId: created.id,
        password: await ctx.password.hash(tempPassword),
      })
      userId = created.id
      break
    }
    if (!userId) return { error: 'No se pudo generar un usuario único para el acceso.' }

    await db.update(students).set({ email, user_id: userId }).where(eq(students.id, studentId))
  } catch (e) {
    if (userId) await db.delete(userTable).where(eq(userTable.id, userId)).catch(() => {})
    return { error: friendlyError(e, 'No se pudo crear el acceso.') }
  }

  revalidatePath(`/dashboard/alumnos/${studentId}`)
  return { tempPassword, email }
}

/** Genera una contraseña temporal nueva para un alumno que ya tiene cuenta (ej: se olvidó la contraseña). */
export async function resetStudentPasswordAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const studentId = String(formData.get('student_id') ?? '')
  if (!studentId) return { error: 'Falta el alumno.' }

  await requireAdmin()
  const tempPassword = generateTempPassword()
  try {
    // El usuario sale de la fila del alumno, nunca del formulario: un admin no puede resetear una cuenta ajena al alumno.
    const [student] = await db.select({ user_id: students.user_id }).from(students).where(eq(students.id, studentId)).limit(1)
    if (!student?.user_id) return { error: 'Este alumno todavía no tiene acceso.' }
    const [existing] = await db.select({ id: userTable.id, email: userTable.email }).from(userTable).where(eq(userTable.id, student.user_id)).limit(1)
    if (!existing) return { error: 'No se pudo encontrar la cuenta.' }

    const ctx = await auth.$context
    await ctx.internalAdapter.updatePassword(existing.id, await ctx.password.hash(tempPassword))
    await db.update(userTable).set({ mustChangePassword: true }).where(eq(userTable.id, existing.id))
    await db.delete(sessionTable).where(eq(sessionTable.userId, existing.id))

    revalidatePath(`/dashboard/alumnos/${studentId}`)
    return { tempPassword, email: existing.email }
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo regenerar la contraseña.') }
  }
}
