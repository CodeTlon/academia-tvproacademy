#!/usr/bin/env node
// Copia el bucket `media` de Supabase Storage a disco (out/storage/), listo para cargarse en el volumen del servidor,
// y genera out/reescribir-urls.sql para apuntar las URLs guardadas en la base a /media/<ruta>.
// Solo LEE de Supabase (lista por SELECT read-only, descarga por URL pública). Dry-run por defecto.
//
// Los nombres que /media no puede servir (espacios, paréntesis, acentos) se renombran; el SQL reescribe esas URLs una por una.
// Uso: node 05-copiar-storage.mjs          # lista, calcula renombres y escribe el SQL; no descarga
//      node 05-copiar-storage.mjs --yes    # descarga a out/storage/
// Cargar en el volumen:  tar -C out/storage -cf - . | docker exec -i <contenedor-app> tar -C /data/storage -xf -
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { env, need, ro, out } from './lib-supabase.mjs'

need('SUPABASE_URL')
const APPLY = process.argv.includes('--yes')
const BUCKET = 'media'
const destino = resolve(out, 'storage')

const objetos = (await ro(`select name, coalesce((metadata->>'size')::bigint,0) as size from storage.objects where bucket_id='${BUCKET}' order by name`))
  .map((o) => ({ name: o.name, size: Number(o.size) }))
const total = objetos.reduce((a, o) => a + o.size, 0)
console.log(`${objetos.length} objetos, ${(total / 1048576).toFixed(1)} MB en ${BUCKET}`)

// Nombre servible por /media: segmentos [A-Za-z0-9._-], sin empezar con símbolo, hasta 4 niveles. Sin colisiones.
const limpio = (seg) => seg.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/-+(\.[^.]+)$/, '$1')
const usados = new Set()
for (const o of objetos) {
  const partes = o.name.split('/').map(limpio)
  if (partes.length > 4 || partes.some((p) => !p)) { console.error(`Nombre no migrable: ${o.name}`); process.exit(1) }
  let nuevo = partes.join('/')
  for (let i = 2; usados.has(nuevo.toLowerCase()); i++) nuevo = partes.slice(0, -1).concat(partes.at(-1).replace(/(\.[^.]+)$/, `-${i}$1`)).join('/')
  usados.add(nuevo.toLowerCase())
  o.nuevo = nuevo
}
// /media solo sirve estas extensiones (src/lib/storage.ts); un objeto con otra no se podría ver tras el corte.
const SERVIBLES = new Set(['webp','jpg','jpeg','png','avif','gif','pdf','mp4','webm','mov'])
const noServibles = objetos.filter((o) => !SERVIBLES.has(o.nuevo.split('.').pop().toLowerCase()))
if (noServibles.length) { console.error(`Extensión no servible por /media: ${noServibles.map((o) => o.name).join(', ')}`); process.exit(1) }
const renombrados = objetos.filter((o) => o.nuevo !== o.name)
console.log(`Renombrados: ${renombrados.length}${renombrados.length ? ' -> ' + renombrados.map((o) => `${o.name} => ${o.nuevo}`).join(' | ') : ''}`)

const base = env.SUPABASE_URL.replace(/\/$/, '')
const viejo = `${base}/storage/v1/object/public/${BUCKET}/`
const codificado = (n) => n.split('/').map(encodeURIComponent).join('/')
writeFileSync(resolve(out, 'url-map.json'), JSON.stringify({ viejo, objetos }, null, 2))

// Reescritura por objeto (más largos primero) en toda columna text/varchar/jsonb de public: cubre cover_image,
// attachment_url, video_url, site_settings, fotos de coaches e imágenes embebidas en posts.content.
// Se ejecuta contra la base NUEVA, ya con los datos cargados.
const cols = (await ro(`select table_name, column_name, data_type from information_schema.columns
  where table_schema='public' and data_type in ('text','character varying','jsonb') order by 1,2`))
const lit = (s) => `'${s.replace(/'/g, "''")}'`
const pares = []
for (const o of [...objetos].sort((a, b) => b.name.length - a.name.length)) {
  const nuevoUrl = `/media/${o.nuevo}`
  const formas = new Set([viejo + o.name, viejo + codificado(o.name)])
  for (const f of formas) pares.push([f, nuevoUrl])
}
const sql = ['begin;']
for (const { table_name: t, column_name: c, data_type: ty } of cols) {
  for (const [v, n] of pares) {
    sql.push(ty === 'jsonb'
      ? `update public."${t}" set "${c}" = replace("${c}"::text, ${lit(v)}, ${lit(n)})::jsonb where "${c}"::text like ${lit('%' + v + '%')};`
      : `update public."${t}" set "${c}" = replace("${c}", ${lit(v)}, ${lit(n)}) where "${c}" like ${lit('%' + v + '%')};`)
  }
}
sql.push('commit;', '')
writeFileSync(resolve(out, 'reescribir-urls.sql'), sql.join('\n'))
// Control posterior: no debe quedar ninguna referencia a Supabase Storage en la base nueva.
writeFileSync(resolve(out, 'verificar-urls.sql'), cols.map(({ table_name: t, column_name: c, data_type: ty }) =>
  `select '${t}.${c}' as columna, count(*) as restantes from public."${t}" where "${c}"${ty === 'jsonb' ? '::text' : ''} like '%supabase.co%';`).join('\n') + '\n')
console.log(`Escrito out/url-map.json, out/reescribir-urls.sql (${pares.length} pares x ${cols.length} columnas) y out/verificar-urls.sql`)

if (!APPLY) { console.log('Dry-run: no se descargó nada. Re-correr con --yes.'); process.exit(0) }

mkdirSync(destino, { recursive: true })
let ok = 0, salteados = 0
const fallos = []
for (const o of objetos) {
  const abs = resolve(destino, o.nuevo)
  try {
    if (existsSync(abs) && statSync(abs).size === o.size) { salteados++; continue }
    const r = await fetch(viejo + codificado(o.name))
    if (!r.ok) throw new Error(`descarga ${r.status}`)
    const buf = Buffer.from(await r.arrayBuffer())
    if (o.size && buf.length !== o.size) throw new Error(`tamaño ${buf.length} != ${o.size}`)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, buf)
    ok++
  } catch (e) { fallos.push(`${o.name}: ${e.message}`) }
}
console.log(`Descargados ${ok}, ya existían ${salteados}, fallidos ${fallos.length}`)
if (fallos.length) { writeFileSync(resolve(out, 'storage-fallos.txt'), fallos.join('\n')); console.error('Ver out/storage-fallos.txt'); process.exit(1) }
console.log(`Listo en ${destino}`)
