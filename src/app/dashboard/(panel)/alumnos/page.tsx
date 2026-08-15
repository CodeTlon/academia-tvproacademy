import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getStudentsWithStatus } from '@/lib/students'
import PageHeader from '@/components/dashboard/PageHeader'
import AlumnosList from './AlumnosList'

export default async function AlumnosListPage() {
  const students = await getStudentsWithStatus()

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Alumnos"
        description="Asistencia, clases restantes y pagos — se calcula solo, no hace falta anotar en el cuaderno."
        actions={
          <Link
            href="/dashboard/alumnos/nuevo"
            className="inline-flex items-center gap-2 bg-gold text-on-gold px-4 py-2.5 rounded-md font-bold text-sm hover:brightness-95 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo alumno
          </Link>
        }
      />

      {students.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Todavía no hay alumnos. Creá el primero con &quot;Nuevo alumno&quot;.</p>
        </div>
      ) : (
        <AlumnosList students={students} />
      )}
    </div>
  )
}
