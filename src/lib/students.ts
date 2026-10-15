import { asc, desc, eq } from 'drizzle-orm'
import { db } from './db'
import { classAttendance, payments, students } from '@/db/schema'
import { getUser } from './session'
import { todayStr } from './date'

export type StatusOverride = 'al_dia' | 'vencido' | null

export type Student = {
  id: string
  name: string
  phone: string | null
  email: string | null
  user_id: string | null
  weekly_frequency: number
  price_per_class: number | null
  active: boolean
  status_override: StatusOverride
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

/** `status_override` pisa el cálculo automático — para cuando se dejó al alumno al día
 * "de palabra" (o se lo cortó) y el sistema todavía no lo refleja por clases/pagos. */
function resolveExpired(statusOverride: StatusOverride, autoExpired: boolean) {
  if (statusOverride === 'al_dia') return false
  if (statusOverride === 'vencido') return true
  return autoExpired
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
  const [studentRows, attendance, paymentRows] = await Promise.all([
    db.select().from(students).orderBy(asc(students.name)),
    db.select({ student_id: classAttendance.student_id, class_date: classAttendance.class_date }).from(classAttendance),
    db.select({ student_id: payments.student_id, paid_at: payments.paid_at }).from(payments).orderBy(desc(payments.paid_at)),
  ])

  const today = todayStr()

  return studentRows.map((student) => {
    const lastPaymentAt = paymentRows.find((p) => p.student_id === student.id)?.paid_at ?? null
    const cycleStart = lastPaymentAt ?? student.created_at.slice(0, 10)
    const cycleEnd = addMonths(cycleStart, 1)
    const totalTaken = attendance.filter((a) => a.student_id === student.id).length
    const classesAllowed = student.weekly_frequency * 4
    const classesTaken = classesInCurrentCycle(totalTaken, classesAllowed)
    const classesRemaining = classesAllowed - classesTaken
    const expired = resolveExpired(student.status_override, classesRemaining <= 0 || today >= cycleEnd)

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

/** Id del alumno ligado a la sesión actual (portal) — null si no hay sesión o no está vinculada. */
export async function getMyStudentId(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  const [row] = await db.select({ id: students.id }).from(students).where(eq(students.user_id, user.id)).limit(1)
  return row?.id ?? null
}

export async function getStudentDetail(id: string) {
  // Un id que no es UUID haría fallar la consulta en Postgres: se trata como "no existe".
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null
  const [[student], attendance, paymentRows] = await Promise.all([
    db.select().from(students).where(eq(students.id, id)).limit(1),
    db.select({ id: classAttendance.id, class_date: classAttendance.class_date, class_time: classAttendance.class_time, excused: classAttendance.excused })
      .from(classAttendance).where(eq(classAttendance.student_id, id)).orderBy(desc(classAttendance.class_date)),
    db.select({ id: payments.id, paid_at: payments.paid_at, amount: payments.amount, classes_qty: payments.classes_qty })
      .from(payments).where(eq(payments.student_id, id)).orderBy(desc(payments.paid_at)),
  ])
  if (!student) return null

  const lastPaymentAt = paymentRows[0]?.paid_at ?? null
  const cycleStart = lastPaymentAt ?? student.created_at.slice(0, 10)
  const cycleEnd = addMonths(cycleStart, 1)
  const classesAllowed = student.weekly_frequency * 4
  const totalTaken = attendance.length
  const classesTaken = classesInCurrentCycle(totalTaken, classesAllowed)
  const classesRemaining = classesAllowed - classesTaken
  const expired = resolveExpired(student.status_override, classesRemaining <= 0 || todayStr() >= cycleEnd)
  // Fecha de la clase más vieja que todavía forma parte del bloque de 8 sin
  // completar — para marcar en la lista cuáles cuentan del ciclo actual.
  const currentBlockStart = classesTaken > 0 ? [...attendance].sort((a, b) => a.class_date.localeCompare(b.class_date))[totalTaken - classesTaken]?.class_date : null

  return {
    student: student as Student,
    attendance,
    payments: paymentRows,
    cycleStart,
    cycleEnd,
    classesAllowed,
    classesTaken,
    classesRemaining,
    expired,
    currentBlockStart,
  }
}
