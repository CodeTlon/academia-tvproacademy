const TZ = 'America/Argentina/Buenos_Aires'

/** Fecha de hoy en huso horario Argentina (no UTC) — `new Date().toISOString()` da la fecha
 * UTC, que de 21:00 a 23:59 hora local ya cayó en el día siguiente y desalinea asistencia/pagos. */
export function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}
