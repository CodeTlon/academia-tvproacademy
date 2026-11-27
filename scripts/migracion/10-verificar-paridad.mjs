#!/usr/bin/env node
// Compara el SNAPSHOT de Supabase (origen) contra la base y el volumen NUEVOS (destino): fila por fila, usuarios (incluido que el hash
// de contraseña sea idéntico) y sha256 de cada archivo. Nunca imprime valores: solo conteos y nombres de tabla/columna.
// Las URLs de Supabase Storage del origen se reescriben a /media/<ruta> antes de comparar (es el cambio intencional).
//
//   SNAPSHOT=~/migracion-tvpro/<fecha>  DEST_PSQL='docker exec -i <db> psql -U <user> -d <base> -tA'  DEST_APP=<contenedor-app>  node 10-verificar-paridad.mjs
// Dentro del contenedor de la app (en-contenedor.mjs): sin DEST_PSQL usa DATABASE_URL y sin DEST_APP lee STORAGE_DIR.
// ANONIMIZADO=1 ignora `students.name` y `students.phone` (el import de test los anonimiza a propósito).
// Sale con código 1 si hay cualquier diferencia.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { resolve, relative } from 'node:path'

const SNAP = resolve((process.env.SNAPSHOT ?? '').replace(/^~/, process.env.HOME))
const { DEST_PSQL, DEST_APP, DATABASE_URL, STORAGE_DIR, ANONIMIZADO } = process.env
const local = !DEST_PSQL && !DEST_APP
if (!existsSync(SNAP) || (local ? !DATABASE_URL || !STORAGE_DIR : !DEST_PSQL || !DEST_APP)) { console.error('Faltan SNAPSHOT y DEST_PSQL/DEST_APP, o DATABASE_URL/STORAGE_DIR (ver encabezado)'); process.exit(2) }
const j = (f) => JSON.parse(readFileSync(resolve(SNAP, f), 'utf8'))
let pgDest
async function psql(sql) {
  if (!local) return execSync(DEST_PSQL, { input: sql, maxBuffer: 1 << 28 }).toString().trim()
  if (!pgDest) {
    const { default: pg } = await import('pg')
    pgDest = new pg.Client({ connectionString: DATABASE_URL })
    await pgDest.connect()
  }
  const { rows } = await pgDest.query({ text: sql, rowMode: 'array' })
  const v = rows[0]?.[0]
  return v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v)
}
const ignorar = (t, c) => ANONIMIZADO === '1' && t === 'students' && (c === 'name' || c === 'phone')
const { viejo, objetos } = j('url-map.json')
let fallas = 0
const falla = (m) => { fallas++; console.log('DIFF ', m) }
const ok = (m) => console.log('ok   ' + m)

// --- normalización: URLs de Supabase -> /media; fechas a epoch ms; jsonb ya parseado
const cod = (n) => n.split('/').map(encodeURIComponent).join('/')
const reglas = [...objetos].sort((a, b) => b.name.length - a.name.length).flatMap((o) => [[viejo + o.name, `/media/${o.nuevo}`], [viejo + cod(o.name), `/media/${o.nuevo}`]])
const reescribir = (s) => reglas.reduce((acc, [v, n]) => acc.split(v).join(n), s)
const ISO = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?)?$/
const norm = (v) => {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return ISO.test(v) ? Date.parse(/(Z|[+-]\d{2}(:?\d{2})?)$/.test(v) ? v.replace(' ', 'T') : v.replace(' ', 'T') + 'Z') : v
  if (Array.isArray(v)) return v.map(norm)
  if (typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]))
  return v
}

// --- 1. tablas
const conteos = j('data/_conteos.json')
for (const t of Object.keys(conteos)) {
  const origen = JSON.parse(reescribir(JSON.stringify(j(`data/${t}.json`))))
  const destino = JSON.parse(await psql(`select coalesce(json_agg(t), '[]'::json) from public."${t}" t`) || '[]')
  if (origen.length !== destino.length) { falla(`${t}: filas origen=${origen.length} destino=${destino.length}`); continue }
  if (!origen.length) { ok(`${t}: 0 filas en ambos`); continue }
  const pk = 'id' in origen[0] ? 'id' : 'key'
  const porPk = new Map(destino.map((r) => [String(r[pk]), r]))
  const colsDif = new Map()
  for (const r of origen) {
    const d = porPk.get(String(r[pk]))
    if (!d) { falla(`${t}: falta una fila en destino (${pk}=${String(r[pk]).slice(0, 8)}…)`); continue }
    for (const c of Object.keys(r)) if (ignorar(t, c)) continue
      else if (!(c in d)) colsDif.set(c, 'columna inexistente en destino')
      else if (JSON.stringify(norm(r[c])) !== JSON.stringify(norm(d[c]))) colsDif.set(c, (colsDif.get(c) ?? 0) + 1)
  }
  if (colsDif.size) falla(`${t}: columnas con diferencias -> ${[...colsDif].map(([c, n]) => `${c}(${n})`).join(', ')}`)
  else ok(`${t}: ${origen.length} filas idénticas (todas las columnas)`)
}

// --- 2. usuarios (sin imprimir emails ni hashes)
const us = j('data/auth_users.json')
const dest = JSON.parse(await psql(`select coalesce(json_agg(json_build_object('id',u.id,'email',u.email,'role',u.role,'ev',u.email_verified,'mcp',u.must_change_password,'pw',a.password)), '[]'::json) from "user" u left join account a on a.user_id=u.id and a.provider_id='credential'`))
if (us.length !== dest.length) falla(`usuarios: origen=${us.length} destino=${dest.length}`)
let uOk = 0
for (const u of us) {
  const d = dest.find((x) => x.id === u.id)
  if (!d) { falla('usuarios: falta un usuario (id ' + u.id.slice(0, 8) + '…)'); continue }
  const errs = []
  if (d.email !== u.email.toLowerCase()) errs.push('email')
  if (d.role !== u.rol) errs.push('rol')
  if (!!d.mcp !== !!u.must_change) errs.push('cambio de contraseña pendiente')
  if (!!d.ev !== !!u.email_confirmed_at) errs.push('email verificado')
  if (d.pw !== u.encrypted_password) errs.push('hash de contraseña')
  if (errs.length) falla(`usuario ${u.id.slice(0, 8)}…: difiere ${errs.join(', ')}`)
  else uOk++
}
if (uOk === us.length && us.length === dest.length) ok(`usuarios: ${uOk} idénticos (id, email, rol, verificado y hash de contraseña)`)

// --- 3. archivos: sha256 de la copia del snapshot vs el del volumen del servidor nuevo
let fOk = 0
const archivosLocales = (dir) => readdirSync(dir, { withFileTypes: true, recursive: true }).filter((e) => e.isFile())
  .map((e) => resolve(e.parentPath ?? e.path, e.name))
const enVolumen = local
  ? new Map(archivosLocales(STORAGE_DIR).map((f) => [relative(STORAGE_DIR, f), createHash('sha256').update(readFileSync(f)).digest('hex')]))
  : new Map(execSync(`docker exec ${DEST_APP} sh -c "cd /data/storage && find . -type f -exec sha256sum {} +"`, { maxBuffer: 1 << 28 }).toString().trim().split('\n').filter(Boolean).map((l) => { const [h, ...p] = l.split(/\s+/); return [p.join(' ').replace(/^\.\//, ''), h] }))
for (const o of objetos) {
  const origen = createHash('sha256').update(readFileSync(resolve(SNAP, 'storage', o.nuevo))).digest('hex')
  const d = enVolumen.get(o.nuevo)
  if (!d) falla(`archivo ausente en el volumen: ${o.nuevo}`)
  else if (d !== origen) falla(`archivo distinto (sha256): ${o.nuevo}`)
  else fOk++
}
if (enVolumen.size !== objetos.length) falla(`volumen tiene ${enVolumen.size} archivos y el origen ${objetos.length}`)
if (fOk === objetos.length) ok(`archivos: ${fOk}/${objetos.length} idénticos byte a byte (sha256)`)

// --- 4. el snapshot sigue vigente respecto de la producción actual (conteos en vivo)
console.log(fallas ? `\nPARIDAD FALLÓ: ${fallas} diferencia(s)` : '\nPARIDAD OK: destino idéntico al snapshot')
if (pgDest) await pgDest.end()
process.exit(fallas ? 1 : 0)
