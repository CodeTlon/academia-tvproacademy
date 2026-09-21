# DOMAIN.md

Reglas de negocio del panel de alumnos. FACT — todo derivado de `src/lib/students.ts` y
`src/actions/students.ts`, leídos completos.

## El estado de un alumno nunca se guarda — se calcula en caliente

No hay una columna `status` en `students`. `getStudentsWithStatus()` /`getStudentDetail()`
(`src/lib/students.ts`) recalculan, en cada request, dos cosas **independientes**:

1. **Clases del ciclo actual**: cuenta TODAS las clases marcadas en `class_attendance` para ese
   alumno (asistió, o faltó — con o sin `excused` — **todas descuentan del ciclo por igual**,
   ver nota de inconsistencia abajo). `classesAllowed = weekly_frequency * 4`. El ciclo es
   corrido: si un alumno lleva 12 clases tomadas y su ciclo es de 8, ya cerró el primer bloque y
   va 4/8 del segundo (`classesInCurrentCycle`, aritmética modular).
2. **Vencimiento de cuota**: el pago vence 1 mes después del último `payments.paid_at` (o de
   `students.created_at` si nunca pagó). Suma de meses con clamp al último día del mes destino
   (31 ene + 1 mes = 28/29 feb, no "3 de marzo" como haría un `setMonth` crudo con overflow) —
   importante porque los alumnos pagan cualquier día del mes, no solo el 1.

**"Vencido" = cualquiera de las dos** (se acabaron las clases del bloque, O venció el mes).

`status_override` (`'al_dia' | 'vencido' | null`, columna en `students`) pisa el cálculo
automático por completo — para cuando se dejó a un alumno al día "de palabra" (o se lo cortó) y
el sistema todavía no lo refleja. `resolveExpired()` lo chequea primero, antes de mirar clases o
pago.

Registrar un pago (`addPaymentAction`) mueve la fecha de vencimiento de la cuota, pero **NO
reinicia el conteo de clases** — son corridos e independientes.

⚠️ **Inconsistencia menor sin confirmar (BAJA, no se tocó código para resolverla)**: el
comentario de la migración `007_excused_absence.sql` dice que una ausencia justificada
(`excused = true`) "no debe descontar del ciclo", pero el comentario en `students.ts` (línea ~64)
dice lo contrario: "una ausencia justificada también se pierde, solo queda anotado el motivo", y
el código efectivamente cuenta `excused` igual que cualquier otra fila de `class_attendance`. Si
tocás esta lógica, confirmá primero con el usuario cuál es el comportamiento correcto — no asumas
que el código actual es el deseado solo porque es lo que hay hoy.

## Alta de cuenta de portal (FACT — `createStudentAccountAction`)

- El admin da de alta la cuenta desde la ficha del alumno (`/dashboard/alumnos/[id]`). Genera una
  contraseña temporal random (8 caracteres, alfabeto sin ambiguos — sin `0/O/1/I/l`) y un email
  **sintético**: `slugify(nombre)@tvproacademy.com.ar` (con sufijo numérico si ya existe otro
  alumno con el mismo nombre normalizado).
- Ese email **nunca recibe nada** — Supabase Auth lo exige como identificador único de login,
  pero no hay envío de mail real (coherente con que `resend` esté en `package.json` sin ningún
  call site en `src/`).
- La contraseña temporal se muestra una sola vez en pantalla al admin, que se la pasa al alumno
  **fuera del sistema** (WhatsApp). `must_change_password: true` en `app_metadata` fuerza el
  cambio en el primer login (gateado por `middleware.ts`).
- Al borrar un alumno con cuenta de portal (`deleteStudentAction`), se borra primero el usuario
  de Supabase Auth y después la fila — si no, el email sintético queda "tomado" para siempre y un
  alumno nuevo con el mismo nombre no puede recibir cuenta (bug real que ya pasó, según el
  comentario en el código).
