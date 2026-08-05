'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { todayStr } from '@/lib/date'
import { requireUser } from './auth'

export type StudentState = { error?: string } | undefined

function parseStudentForm(formData: FormData) {
  const price = String(formData.get('price_per_class') ?? '').trim()
  return {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || null,
    weekly_frequency: Number(formData.get('weekly_frequency') ?? 2),
    price_per_class: price ? Number(price) : null,
  }
}

export async function createStudentAction(_prev: StudentState, formData: FormData): Promise<StudentState> {
  try {
    await requireUser()
    // Sin `active`: los alumnos nuevos siempre arrancan activos (default de la tabla) — el
    // checkbox recién aparece en el form de edición, así que acá no viaja en el FormData.
    const data = parseStudentForm(formData)
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('students').insert(data)
    if (error) return { error: friendlyError(error, 'No se pudo crear el alumno.') }

    revalidatePath('/dashboard/alumnos')
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo crear el alumno.') }
  }
  redirect('/dashboard/alumnos?saved=created')
}

export async function updateStudentAction(id: string, _prev: StudentState, formData: FormData): Promise<StudentState> {
  try {
    await requireUser()
    const data = { ...parseStudentForm(formData), active: formData.get('active') === 'on' }
    if (!data.name) return { error: 'El nombre es obligatorio.' }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('students').update(data).eq('id', id)
    if (error) return { error: friendlyError(error, 'No se pudo guardar el alumno.') }

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
  await requireUser()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error, 'No se pudo eliminar el alumno.'))
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
  await requireUser()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('class_attendance')
    .upsert(
      { student_id: studentId, class_date: classDate, class_time: classTime, excused },
      { onConflict: 'student_id,class_date', ignoreDuplicates: true },
    )
  if (error) throw new Error(friendlyError(error, 'No se pudo marcar la clase.'))
  revalidatePath('/dashboard/alumnos')
  revalidatePath(`/dashboard/alumnos/${studentId}`)
  redirect(redirectTo)
}

export async function unmarkAttendanceAction(formData: FormData) {
  const attendanceId = String(formData.get('attendance_id') ?? '')
  const studentId = String(formData.get('student_id') ?? '')
  if (!attendanceId) return
  await requireUser()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('class_attendance').delete().eq('id', attendanceId)
  if (error) throw new Error(friendlyError(error, 'No se pudo quitar la asistencia.'))
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
  await requireUser()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('payments').insert({
    student_id: studentId,
    paid_at: paidAt,
    amount: amountRaw ? Number(amountRaw) : null,
    classes_qty: qtyRaw ? Number(qtyRaw) : null,
  })
  if (error) throw new Error(friendlyError(error, 'No se pudo registrar el pago.'))
  revalidatePath('/dashboard/alumnos')
  revalidatePath(`/dashboard/alumnos/${studentId}`)
  redirect(redirectTo)
}

export async function deletePaymentAction(formData: FormData) {
  const paymentId = String(formData.get('payment_id') ?? '')
  const studentId = String(formData.get('student_id') ?? '')
  if (!paymentId) return
  await requireUser()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('payments').delete().eq('id', paymentId)
  if (error) throw new Error(friendlyError(error, 'No se pudo eliminar el pago.'))
  revalidatePath('/dashboard/alumnos')
  if (studentId) revalidatePath(`/dashboard/alumnos/${studentId}`)
}
