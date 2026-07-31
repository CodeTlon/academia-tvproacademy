import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StudentForm from '../StudentForm'

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/alumnos" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Volver a alumnos
      </Link>
      <PageHeader title="Nuevo alumno" />
      <StudentForm />
    </div>
  )
}
