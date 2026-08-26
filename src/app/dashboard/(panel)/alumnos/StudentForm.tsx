'use client'

import { useActionState, useState } from 'react'
import { createStudentAction, updateStudentAction, type StudentState } from '@/actions/students'
import { TextField, Checkbox, fieldLabel, fieldInput } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Student } from '@/lib/students'

export default function StudentForm({ student }: { student?: Student }) {
  const isEdit = !!student
  const action = isEdit ? updateStudentAction.bind(null, student.id) : createStudentAction
  const [state, formAction] = useActionState<StudentState, FormData>(action, undefined)
  const [weeklyFrequency, setWeeklyFrequency] = useState(student?.weekly_frequency ?? 2)
  const [pricePerClass, setPricePerClass] = useState(student?.price_per_class ?? null)
  const monthlyClasses = weeklyFrequency * 4

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price_per_class" className={fieldLabel}>Precio por clase</label>
          <input
            id="price_per_class"
            name="price_per_class"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={pricePerClass ?? ''}
            onChange={(e) => setPricePerClass(e.target.value === '' ? null : Number(e.target.value))}
            placeholder="5000"
            className={fieldInput}
          />
          <p className="text-zinc-400 text-xs mt-1.5">Precio 100% personalizado por alumno — poné el que corresponda, no hay tarifa fija.</p>
        </div>

        <div>
          <label htmlFor="weekly_frequency" className={fieldLabel}>Clases por semana</label>
          <input
            id="weekly_frequency"
            name="weekly_frequency"
            type="number"
            inputMode="numeric"
            min={1}
            max={7}
            step={1}
            value={weeklyFrequency}
            onChange={(e) => setWeeklyFrequency(Math.min(7, Math.max(1, Number(e.target.value) || 1)))}
            className={fieldInput}
          />
          <p className="text-zinc-400 text-xs mt-1.5">La cantidad que quieras, de 1 a 7 por semana.</p>
        </div>
      </div>

      <p className="text-zinc-500 text-xs -mt-2">
        = {monthlyClasses} clases/mes
        {pricePerClass != null && ` · $${(pricePerClass * monthlyClasses).toLocaleString('es-AR')}/mes`}
      </p>

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
