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

/** Del total de clases tomadas (asistió o faltó, justificado o no — todas descuentan
 * por igual), cuántas caen en el bloque de 8 (o lo que corresponda) todavía sin
 * completar. Ej: 12 tomadas, ciclo de 8 → ya cerró el primer bloque, van 4 del segundo. */
function classesInCurrentCycle(totalTaken: number, classesAllowed: number) {
  return totalTaken === 0 ? 0 : ((totalTaken - 1) % classesAllowed) + 1
}

/**
 * Estado de cada alumno — no se guarda "vencido" en la base, se calcula siempre
 * en caliente. Son dos cosas independientes:
 * - Clases del ciclo: cuentan TODAS las marcadas (asistió, o faltó con o sin
 *   aviso — una ausencia justificada también se pierde, solo queda anotado el
 *   motivo). Es un conteo corrido, no se reinicia con el pago.
 * - Vencimiento: el pago vence 1 mes después del último pago (o del alta si
 *   nunca pagó) — es la fecha de vencimiento de la cuota, no depende de cuántas
 *   clases haya tomado.
 * "Vencido" es cualquiera de las dos: se acabaron las 8 clases del bloque, o
 * venció el mes.
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
    const totalTaken = (attendance ?? []).filter((a) => a.student_id === student.id).length
    const classesAllowed = student.weekly_frequency * 4
    const classesTaken = classesInCurrentCycle(totalTaken, classesAllowed)
    const classesRemaining = classesAllowed - classesTaken
    const expired = classesRemaining <= 0 || today >= cycleEnd

    return {
      ...student,
      lastPaymentAt,
      cycleStart,
      cycleEnd,
      classesAllowed,
      classesTaken,
      classesRemaining,
      expired,
    }
  })
}

export async function getStudentDetail(id: string) {
  const supabase = await createSupabaseServerClient()
  const [{ data: student }, { data: attendance }, { data: payments }] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('class_attendance').select('id, class_date, class_time, excused').eq('student_id', id).order('class_date', { ascending: false }),
    supabase.from('payments').select('id, paid_at, amount, classes_qty').eq('student_id', id).order('paid_at', { ascending: false }),
  ])
  if (!student) return null

  const lastPaymentAt = payments?.[0]?.paid_at ?? null
  const cycleStart = lastPaymentAt ?? student.created_at.slice(0, 10)
  const cycleEnd = addMonths(cycleStart, 1)
  const classesAllowed = student.weekly_frequency * 4
  const totalTaken = attendance?.length ?? 0
  const classesTaken = classesInCurrentCycle(totalTaken, classesAllowed)
  const classesRemaining = classesAllowed - classesTaken
  const expired = classesRemaining <= 0 || todayStr() >= cycleEnd
  // Fecha de la clase más vieja que todavía forma parte del bloque de 8 sin
  // completar — para marcar en la lista cuáles cuentan del ciclo actual.
  const currentBlockStart = classesTaken > 0 ? [...(attendance ?? [])].sort((a, b) => a.class_date.localeCompare(b.class_date))[totalTaken - classesTaken]?.class_date : null

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
    currentBlockStart,
  }
}
