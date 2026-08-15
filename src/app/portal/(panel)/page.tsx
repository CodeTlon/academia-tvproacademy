import { notFound } from 'next/navigation'
import { getMyStudentId, getStudentDetail } from '@/lib/students'

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(t: string | null) {
  return t ? t.slice(0, 5) : null
}

export default async function PortalHomePage() {
  const studentId = await getMyStudentId()
  const detail = studentId ? await getStudentDetail(studentId) : null
  if (!detail) notFound()

  const { student, attendance, payments, cycleStart, cycleEnd, classesAllowed, classesTaken, classesRemaining, expired, currentBlockStart } = detail

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">Hola, {student.name.split(' ')[0]}</h1>

      <div className={`rounded-xl border p-4 mb-6 ${expired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <p className={`text-sm font-bold ${expired ? 'text-red-700' : 'text-green-700'}`}>
          {expired ? 'Vencido — necesita renovar' : `Al día — quedan ${classesRemaining} clases`}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Cuota desde {fmtDate(cycleStart)}, vence {fmtDate(cycleEnd)} · {classesTaken}/{classesAllowed} clases del bloque actual
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Clases tomadas</h2>
        {attendance.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin clases registradas todavía.</p>
        ) : (
          <ul className="space-y-1.5 max-h-64 overflow-y-auto">
            {attendance.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm bg-zinc-50 border border-zinc-100 rounded-md px-3 py-2">
                <span className={currentBlockStart && a.class_date >= currentBlockStart ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}>
                  {fmtDate(a.class_date)}
                  {fmtTime(a.class_time) && <span className="text-zinc-400 font-normal"> — {fmtTime(a.class_time)}</span>}
                  {a.excused && <span className="text-amber-600 font-normal"> — justificada</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Pagos</h2>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
