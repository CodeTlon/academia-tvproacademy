import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { getStudentDetail } from '@/lib/students'
import { markAttendanceAction, unmarkAttendanceAction, addPaymentAction, deletePaymentAction } from '@/actions/students'
import PageHeader from '@/components/dashboard/PageHeader'
import { fieldInput } from '@/components/dashboard/Field'
import StudentForm from '../StudentForm'

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getStudentDetail(id)
  if (!detail) notFound()

  const { student, attendance, payments, cycleStart, cycleEnd, classesAllowed, classesTaken, classesRemaining, expired } = detail

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/alumnos" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver a alumnos
      </Link>
      <PageHeader title={student.name} />

      <div className={`rounded-xl border p-4 mb-6 ${expired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <p className={`text-sm font-bold ${expired ? 'text-red-700' : 'text-green-700'}`}>
          {expired ? 'Vencido — necesita renovar' : `Al día — quedan ${classesRemaining} clases`}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Ciclo desde {fmtDate(cycleStart)} hasta {fmtDate(cycleEnd)} · {classesTaken}/{classesAllowed} clases tomadas
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Datos del alumno</h2>
        <StudentForm student={student} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Asistencia</h2>
        <form action={markAttendanceAction} className="flex items-end gap-2 mb-4">
          <input type="hidden" name="student_id" value={student.id} />
          <input type="hidden" name="redirect_to" value={`/dashboard/alumnos/${student.id}`} />
          <div className="flex-1">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Marcar clase</label>
            <input type="date" name="class_date" defaultValue={todayStr()} max={todayStr()} className={fieldInput} />
          </div>
          <button type="submit" className="bg-gold text-on-gold px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95">
            Marcar
          </button>
        </form>

        {attendance.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin clases registradas todavía.</p>
        ) : (
          <ul className="space-y-1.5 max-h-64 overflow-y-auto">
            {attendance.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm bg-zinc-50 border border-zinc-100 rounded-md px-3 py-2">
                <span className={a.class_date >= cycleStart ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}>{fmtDate(a.class_date)}</span>
                <form action={unmarkAttendanceAction}>
                  <input type="hidden" name="attendance_id" value={a.id} />
                  <input type="hidden" name="student_id" value={student.id} />
                  <button type="submit" className="text-zinc-400 hover:text-red-500 transition-colors" aria-label="Quitar">
                    <X size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Pagos</h2>
        <form action={addPaymentAction} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <input type="hidden" name="student_id" value={student.id} />
          <input type="hidden" name="redirect_to" value={`/dashboard/alumnos/${student.id}`} />
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Fecha</label>
            <input type="date" name="paid_at" defaultValue={todayStr()} max={todayStr()} className={fieldInput} />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Monto</label>
            <input
              type="number"
              name="amount"
              placeholder={student.price_per_class ? String(student.price_per_class * classesAllowed) : '20000'}
              className={fieldInput}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Clases</label>
            <input type="number" name="classes_qty" placeholder={String(classesAllowed)} className={fieldInput} />
          </div>
          <button
            type="submit"
            className="col-span-2 sm:col-span-1 self-end bg-gold text-on-gold px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95"
          >
            Registrar
          </button>
        </form>

        {payments.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin pagos registrados todavía.</p>
        ) : (
          <ul className="space-y-1.5">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm bg-zinc-50 border border-zinc-100 rounded-md px-3 py-2">
                <span className={p.paid_at === payments[0].paid_at ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}>
                  {fmtDate(p.paid_at)}
                  {(p.amount != null || p.classes_qty != null) && (
                    <span className="text-zinc-400 font-normal">
                      {' — '}
                      {p.amount != null && `$${p.amount}`}
                      {p.amount != null && p.classes_qty != null && ' · '}
                      {p.classes_qty != null && `${p.classes_qty} clases`}
                    </span>
                  )}
                </span>
                <form action={deletePaymentAction}>
                  <input type="hidden" name="payment_id" value={p.id} />
                  <input type="hidden" name="student_id" value={student.id} />
                  <button type="submit" className="text-zinc-400 hover:text-red-500 transition-colors" aria-label="Quitar">
                    <X size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
