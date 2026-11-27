#!/usr/bin/env node
// Migración Supabase -> base nueva, DENTRO del contenedor de la app en Coolify (no hace falta entrar al servidor).
// La llama docker-entrypoint.sh antes de levantar el servidor, solo si MIGRAR_DESDE_SUPABASE=1:
//   1. Si la base nueva ya tiene usuarios o alumnos, no hace nada (así un reinicio no vuelve a importar).
//   2. Lee Supabase en solo lectura (SUPABASE_DB_URL, pooler de sesión) y arma el snapshot en una carpeta temporal:
//      tablas (07), usuarios con su hash bcrypt (09), archivos del bucket `media` (05) y el SQL de import (08).
//   3. Aplica usuarios + datos + reescritura de URLs en UNA transacción, y copia los archivos al volumen.
//   4. Verifica la paridad (10) y que no queden URLs de Supabase. Borra el snapshot (tiene datos personales).
// Variables: MIGRAR_DESDE_SUPABASE=1, SUPABASE_DB_URL, SUPABASE_URL, DATABASE_URL, STORAGE_DIR.
//   MIGRAR_DATOS_REALES=1 carga los alumnos tal cual (solo producción); sin ella se anonimizan nombre y teléfono.
//   MIGRAR_REEMPLAZAR=<etiqueta> vacía la base (datos, usuarios y sesiones) y vuelve a importar, UNA sola vez por etiqueta:
//   sirve para re-sincronizar justo antes del corte de DNS. Cada import queda registrado en la tabla `_migracion_supabase`,
//   así un reinicio con la misma etiqueta no vuelve a borrar nada.
// Nunca imprime datos: solo conteos y nombres de tabla. Si algo falla, sale con código 1 y la app no arranca.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, cpSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const dir = dirname(fileURLToPath(import.meta.url))
const { DATABASE_URL, STORAGE_DIR, SUPABASE_DB_URL, SUPABASE_URL } = process.env
const REAL = process.env.MIGRAR_DATOS_REALES === '1'
for (const [k, v] of Object.entries({ DATABASE_URL, STORAGE_DIR, SUPABASE_DB_URL, SUPABASE_URL })) {
  if (!v) { console.error(`[migracion] Falta ${k}`); process.exit(1) }
}

const destino = new pg.Client({ connectionString: DATABASE_URL })
await destino.connect()
const contar = async (tabla) => (await destino.query(`select count(*)::int as n from ${tabla}`)).rows[0].n
await destino.query('create table if not exists _migracion_supabase (etiqueta text primary key, hecho_en timestamptz not null default now(), datos_reales boolean not null)')
const REEMPLAZAR = (process.env.MIGRAR_REEMPLAZAR ?? '').trim()
const etiqueta = REEMPLAZAR || 'inicial'
const yaHecha = (await destino.query('select 1 from _migracion_supabase where etiqueta = $1', [etiqueta])).rowCount > 0
const yaTieneDatos = (await contar('"user"')) + (await contar('public.students'))
if (REEMPLAZAR && yaHecha) {
  console.log(`[migracion] El reemplazo "${etiqueta}" ya se hizo: no se importa nada.`)
  await destino.end()
  process.exit(0)
}
if (yaTieneDatos && !REEMPLAZAR) {
  console.log(`[migracion] La base ya tiene datos (${yaTieneDatos} usuarios/alumnos): no se importa nada.`)
  await destino.end()
  process.exit(0)
}

const snap = mkdtempSync(resolve(tmpdir(), 'migracion-'))
const correr = (script, args = [], extra = {}) =>
  execFileSync(process.execPath, [resolve(dir, script), ...args], { env: { ...process.env, MIGRACION_OUT: snap, ...extra }, stdio: 'inherit' })
try {
  console.log(`[migracion] Snapshot de Supabase (solo lectura), alumnos ${REAL ? 'REALES' : 'anonimizados'}`)
  correr('07-exportar-datos.mjs')
  correr('09-exportar-usuarios.mjs')
  correr('05-copiar-storage.mjs', ['--yes'])
  correr('08-generar-import.mjs', REAL ? ['--real'] : [])

  // Una sola transacción: usuarios primero (students.user_id referencia a "user".id), después datos y URLs.
  const sinTx = (f) => readFileSync(resolve(snap, f), 'utf8').replace(/^\s*begin;\s*$/gm, '').replace(/^\s*commit;\s*$/gm, '')
  await destino.query('begin')
  try {
    if (REEMPLAZAR) {
      await destino.query('truncate table public.payments, public.class_attendance, public.students, public.posts, public.site_settings, session, account, verification, "user" cascade')
      console.log(`[migracion] Reemplazo "${etiqueta}": base vaciada dentro de la transacción`)
    }
    await destino.query(sinTx('data/import-usuarios.sql'))
    await destino.query(sinTx(REAL ? 'data/import-real.sql' : 'data/import.sql'))
    await destino.query(sinTx('reescribir-urls.sql'))
    await destino.query('insert into _migracion_supabase (etiqueta, datos_reales) values ($1, $2) on conflict (etiqueta) do update set hecho_en = now(), datos_reales = excluded.datos_reales', [etiqueta, REAL])
    await destino.query('commit')
  } catch (e) {
    await destino.query('rollback')
    throw e
  }
  console.log('[migracion] Datos y usuarios cargados')

  if (existsSync(resolve(snap, 'storage'))) cpSync(resolve(snap, 'storage'), STORAGE_DIR, { recursive: true })
  console.log('[migracion] Archivos copiados al volumen')

  let restantes = 0
  for (const linea of readFileSync(resolve(snap, 'verificar-urls.sql'), 'utf8').split('\n').filter(Boolean)) {
    for (const fila of (await destino.query(linea)).rows) restantes += Number(fila.restantes)
  }
  if (restantes) throw new Error(`quedan ${restantes} referencias a supabase.co en la base nueva`)
  console.log('[migracion] Sin referencias a Supabase en la base nueva')

  correr('10-verificar-paridad.mjs', [], { SNAPSHOT: snap, ANONIMIZADO: REAL ? '0' : '1' })
  console.log('[migracion] Listo')
} catch (e) {
  console.error('[migracion] FALLÓ:', e instanceof Error ? e.message : e)
  process.exitCode = 1
} finally {
  rmSync(snap, { recursive: true, force: true })
  await destino.end()
}
