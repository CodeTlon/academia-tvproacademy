#!/usr/bin/env node
// Genera out/data/import.sql a partir de out/data/*.json: un INSERT por tabla con json_populate_recordset, que toma los tipos
// de la tabla DESTINO (arrays, jsonb, uuid, timestamptz) e ignora columnas que ya no existen. Pensado para la base nueva ya migrada
// (drizzle). Se aplica con psql, p. ej. dentro del contenedor:  docker exec -i <db> psql -U <user> -d <base> -v ON_ERROR_STOP=1 < out/data/import.sql
// Los alumnos y pagos son datos personales reales: el import SIN --real anonimiza nombre y teléfono de `students` (test/dev no deben tener datos reales).
// Con --real se cargan tal cual (solo para el corte a producción). Cargar ANTES import-usuarios.sql: students.user_id referencia a user.id.
// Uso: node 08-generar-import.mjs [--real]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { out } from './lib-supabase.mjs'

const REAL = process.argv.includes('--real')
const datos = resolve(out, 'data')
// Orden por dependencias (padres antes que hijos). Una tabla nueva en el origen que no esté acá hace fallar el script.
const ORDEN = ['site_settings', 'posts', 'students', 'class_attendance', 'payments']
const conteos = JSON.parse(readFileSync(resolve(datos, '_conteos.json'), 'utf8'))
const desconocidas = Object.keys(conteos).filter((t) => !ORDEN.includes(t))
if (desconocidas.length) { console.error(`Tablas sin orden definido: ${desconocidas.join(', ')} (agregarlas a ORDEN)`); process.exit(1) }

const sql = ['begin;']
for (const t of ORDEN) {
  const f = resolve(datos, `${t}.json`)
  if (!existsSync(f)) continue
  let json = readFileSync(f, 'utf8')
  if (json === '[]') continue
  if (json.includes('$tvp$')) { console.error(`${t}: contiene el delimitador $tvp$`); process.exit(1) }
  if (t === 'students' && !REAL) {
    const filas = JSON.parse(json).map((r, i) => ({ ...r, name: `Alumno de prueba ${i + 1}`, phone: r.phone ? '0000000000' : null }))
    json = JSON.stringify(filas)
  }
  sql.push(`insert into public."${t}" select * from json_populate_recordset(null::public."${t}", $tvp$${json}$tvp$::json);`)
}
sql.push('commit;', '')
const archivo = REAL ? 'import-real.sql' : 'import.sql'
writeFileSync(resolve(datos, archivo), sql.join('\n'), { mode: 0o600 })
console.log(`Escrito out/data/${archivo} (${REAL ? 'DATOS REALES' : 'alumnos anonimizados'}) para ${Object.values(conteos).reduce((a, b) => a + b, 0)} filas`)
