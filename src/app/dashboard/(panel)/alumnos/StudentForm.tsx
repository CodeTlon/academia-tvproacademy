'use client'

import { useActionState } from 'react'
import { createStudentAction, updateStudentAction, type StudentState } from '@/actions/students'
import { TextField, Checkbox, fieldLabel, fieldInput } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Student } from '@/lib/students'

export default function StudentForm({ student }: { student?: Student }) {
  const isEdit = !!student
  const action = isEdit ? updateStudentAction.bind(null, student.id) : createStudentAction
  const [state, formAction] = useActionState<StudentState, FormData>(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nombre" name="name" defaultValue={student?.name} required placeholder="Juan Pérez" />
        <TextField label="Teléfono" name="phone" defaultValue={student?.phone ?? ''} placeholder="351 555-5555" />
      </div>

      <TextField
        label="Precio por clase"
        name="price_per_class"
        type="number"
        defaultValue={student?.price_per_class != null ? String(student.price_per_class) : ''}
        placeholder="5000"
        hint="Opcional — para referencia rápida si este alumno paga distinto al resto."
      />

      <div>
        <label htmlFor="weekly_frequency" className={fieldLabel}>Clases por semana</label>
        <select
          id="weekly_frequency"
          name="weekly_frequency"
          defaultValue={student?.weekly_frequency ?? 2}
          className={fieldInput}
        >
          <option value={1}>1 vez por semana (4 clases/mes)</option>
          <option value={2}>2 veces por semana (8 clases/mes)</option>
          <option value={3}>3 veces por semana (12 clases/mes)</option>
          <option value={4}>4 veces por semana (16 clases/mes)</option>
        </select>
        <p className="text-zinc-400 text-xs mt-1.5">Se usa para calcular cuántas clases le quedan en el ciclo.</p>
      </div>

      {isEdit && (
        <Checkbox
          label="Activo"
          name="active"
          defaultChecked={student?.active ?? true}
          hint="Desmarcalo si el alumno dejó — sigue en el historial pero no aparece como pendiente de renovar."
        />
      )}

      {isEdit && (
        <div>
          <label htmlFor="status_override" className={fieldLabel}>Estado de la cuota</label>
          <select
            id="status_override"
            name="status_override"
            defaultValue={student?.status_override ?? ''}
            className={fieldInput}
          >
            <option value="">Automático (calculado por clases y pago)</option>
            <option value="al_dia">Al día</option>
            <option value="vencido">Vencido / no pagó</option>
          </select>
          <p className="text-zinc-400 text-xs mt-1.5">Cambiá esto a mano cuando el cálculo automático no coincide con la realidad (se lo dejó al día de palabra, se cargó un pago por error, etc).</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
