// Utilidades comunes de los scripts de migración. SOLO LECTURA sobre Supabase: las consultas van al endpoint
// /database/query/read-only de la Management API (el servidor rechaza cualquier escritura en una transacción read-only).
// Credenciales en scripts/migracion/.env.migracion (gitignored, chmod 600): SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, SUPABASE_URL.
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const dir = dirname(fileURLToPath(import.meta.url))
// Carpeta de salida: por defecto scripts/migracion/out; MIGRACION_OUT la cambia (p. ej. un snapshot fuera del repo).
export const out = process.env.MIGRACION_OUT ? resolve(process.env.MIGRACION_OUT) : resolve(dir, 'out')
mkdirSync(out, { recursive: true, mode: 0o700 })

const env = { ...process.env }
const envFile = resolve(dir, '.env.migracion')
if (existsSync(envFile)) {
  for (const l of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
export function need(...claves) {
  for (const k of claves) if (!env[k]) { console.error(`Falta ${k} (ver scripts/migracion/README.md)`); process.exit(1) }
}
export { env }

/** SELECT de solo lectura contra el proyecto de Supabase. Devuelve las filas.
 * Con SUPABASE_DB_URL (pooler de sesión de Supabase, IPv4, puerto 5432) va directo a Postgres: cada consulta corre en una
 * transacción READ ONLY (el pooler ignora `default_transaction_read_only` en la conexión, por eso se fuerza por transacción).
 * Las fechas vuelven como texto, igual que en la Management API. Si no, usa la Management API con el token `sbp_`. */
let pgCliente
export async function ro(sql) {
  if (env.SUPABASE_DB_URL) {
    if (!pgCliente) {
      const { default: pg } = await import('pg')
      const comoTexto = (v) => v
      for (const oid of [1082, 1114, 1184]) pg.types.setTypeParser(oid, comoTexto)
      pgCliente = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } })
      await pgCliente.connect()
    }
    await pgCliente.query('begin transaction read only')
    try {
      const { rows } = await pgCliente.query(sql)
      await pgCliente.query('commit')
      return rows
    } catch (e) {
      await pgCliente.query('rollback')
      throw e
    }
  }
  need('SUPABASE_PROJECT_REF', 'SUPABASE_ACCESS_TOKEN')
  const r = await fetch(`https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query/read-only`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const body = await r.json()
  if (!r.ok || !Array.isArray(body)) throw new Error(`Supabase: ${body?.message ?? r.status}`)
  return body
}

/** Cierra la conexión directa (si se abrió) para que el proceso termine. */
export async function cerrar() {
  if (pgCliente) await pgCliente.end()
}
