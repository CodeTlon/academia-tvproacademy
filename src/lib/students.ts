import { createSupabaseServerClient } from './supabase-server'
import { todayStr } from './date'

export type Student = {
  id: string
  name: string
  phone: string | null
  weekly_frequency: number
  price_per_class: number | null
  active: boolean
  created_at: string
}

export type StudentStatus = Student & {
  lastPaymentAt: string | null
  cycleStart: string
  cycleEnd: string
  classesAllowed: number
  classesTaken: number
  classesRemaining: number
  expired: boolean
  attendanceDates: string[]
}

/** Suma meses clampeando al último día del mes destino si no existe (31 ene + 1 mes = 28/29
 * feb, no "3 de marzo" como haría `setMonth` con overflow crudo) — importante porque los
 * alumnos pagan en cualquier día del mes, no solo el 1. */
function addMonths(dateStr: string, months: number) {
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, daysInTargetMonth))
  return d.toISOString().slice(0, 10)
}

/**
 * Estado de cada alumno derivado de sus pagos y asistencias — no se guarda
 * "vencido" en la base, se calcula siempre en caliente. El ciclo vigente
 * arranca en el último pago (o en el alta si nunca pagó) y vence lo que
 * llegue primero: se agotan las clases del ciclo (frecuencia semanal x 4)
 * o pasa 1 mes desde esa fecha.
 */
export async function getStudentsWithStatus(): Promise<StudentStatus[]> {
  const supabase = await createSupabaseServerClient()
  const [{ data: students }, { data: attendance }, { data: payments }] = await Promise.all([
    supabase.from('students').select('*').order('name'),
    supabase.from('class_attendance').select('student_id, class_date'),
    supabase.from('payments').select('student_id, paid_at').order('paid_at', { ascending: false }),
  ])

  const today = todayStr()

  return (students ?? []).map((student) => {
    const lastPaymentAt = (payments ?? []).find((p) => p.student_id === student.id)?.paid_at ?? null
    const cycleStart = lastPaymentAt ?? student.created_at.slice(0, 10)
    const cycleEnd = addMonths(cycleStart, 1)
    const attendanceDates = (attendance ?? [])
      .filter((a) => a.student_id === student.id && a.class_date >= cycleStart)
      .map((a) => a.class_date)
      .sort()
    const classesAllowed = student.weekly_frequency * 4
    const classesTaken = attendanceDates.length
    const classesRemaining = Math.max(0, classesAllowed - classesTaken)
    const expired = !lastPaymentAt || classesRemaining <= 0 || today >= cycleEnd

    return {
      ...student,
      lastPaymentAt,
      cycleStart,
      cycleEnd,
      classesAllowed,
      classesTaken,
      classesRemaining,
      expired,
      attendanceDates,
    }
  })
}

export async function getStudentDetail(id: string) {
  const supabase = await createSupabaseServerClient()
  const [{ data: student }, { data: attendance }, { data: payments }] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('class_attendance').select('id, class_date, class_time').eq('student_id', id).order('class_date', { ascending: false }),
    supabase.from('payments').select('id, paid_at, amount, classes_qty').eq('student_id', id).order('paid_at', { ascending: false }),
  ])
  if (!student) return null

  const lastPaymentAt = payments?.[0]?.paid_at ?? null
  const cycleStart = lastPaymentAt ?? student.created_at.slice(0, 10)
  const cycleEnd = addMonths(cycleStart, 1)
  const classesAllowed = student.weekly_frequency * 4
  const classesTaken = (attendance ?? []).filter((a) => a.class_date >= cycleStart).length
  const classesRemaining = Math.max(0, classesAllowed - classesTaken)
  const expired = !lastPaymentAt || classesRemaining <= 0 || todayStr() >= cycleEnd

  return {
    student: student as Student,
    attendance: attendance ?? [],
    payments: payments ?? [],
    cycleStart,
    cycleEnd,
    classesAllowed,
    classesTaken,
    classesRemaining,
    expired,
  }
}
