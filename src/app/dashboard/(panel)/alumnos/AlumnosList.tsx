'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Pencil, CalendarCheck, Wallet } from 'lucide-react'
import { markAttendanceAction, addPaymentAction, deleteStudentAction } from '@/actions/students'
import { fieldInput } from '@/components/dashboard/Field'
import DeleteButton from '@/components/dashboard/DeleteButton'
import type { StudentStatus } from '@/lib/students'

function fmtDate(d: string | null) {
  if (!d) return 'Nunca'
  return new Date(`${d}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type StatusFilter = 'todos' | 'al_dia' | 'vencido'
type ActiveFilter = 'todos' | 'activos' | 'inactivos'

export default function AlumnosList({ students }: { students: StudentStatus[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [active, setActive] = useState<ActiveFilter>('todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false
      if (status === 'al_dia' && s.expired) return false
      if (status === 'vencido' && !s.expired) return false
      if (active === 'activos' && !s.active) return false
      if (active === 'inactivos' && s.active) return false
      return true
    })
  }, [students, query, status, active])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className={`${fieldInput} pl-9`}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={`${fieldInput} sm:w-44`}>
          <option value="todos">Todos los estados</option>
          <option value="al_dia">Al día</option>
          <option value="vencido">Vencido</option>
        </select>
        <select value={active} onChange={(e) => setActive(e.target.value as ActiveFilter)} className={`${fieldInput} sm:w-40`}>
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Ningún alumno coincide con esos filtros.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100">
          {filtered.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 flex items-center gap-2">
                    {s.name}
                    {!s.active && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5">
                        Inactivo
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {s.weekly_frequency}x/semana{s.price_per_class != null && ` · $${s.price_per_class}/clase`} · {s.classesTaken}/{s.classesAllowed} clases este ciclo · último pago {fmtDate(s.lastPaymentAt)} · vence {fmtDate(s.cycleEnd)}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto flex-shrink-0 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    s.expired ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {s.expired ? 'Vencido' : `Al día · quedan ${s.classesRemaining}`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <form action={markAttendanceAction}>
                  <input type="hidden" name="student_id" value={s.id} />
                  <input type="hidden" name="redirect_to" value="/dashboard/alumnos" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark bg-gold/10 border border-gold/30 hover:bg-gold/20 px-3 py-2 rounded-md transition-colors"
                  >
                    <CalendarCheck size={13} /> Clase hoy
                  </button>
                </form>
                <form action={addPaymentAction}>
                  <input type="hidden" name="student_id" value={s.id} />
                  <input type="hidden" name="redirect_to" value="/dashboard/alumnos" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 px-3 py-2 rounded-md transition-colors"
                  >
                    <Wallet size={13} /> Pago hoy
                  </button>
                </form>
                <Link
                  href={`/dashboard/alumnos/${s.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-3 py-2 rounded-md transition-colors"
                >
                  <Pencil size={13} /> Editar
                </Link>
                <form action={deleteStudentAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <DeleteButton confirmMessage={`¿Eliminar a "${s.name}"? Se borra también su historial de asistencia y pagos.`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
