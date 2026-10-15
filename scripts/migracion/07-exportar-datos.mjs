#!/usr/bin/env node
// Exporta los datos de las tablas de `public` de Supabase a out/data/<tabla>.json (solo lectura) y los conteos a
// out/data/_conteos.json. Los datos tienen PII real (leads): out/ está gitignored y no se debe copiar fuera del servidor.
// Uso: node 07-exportar-datos.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { ro, out } from './lib-supabase.mjs'

const datos = resolve(out, 'data'); mkdirSync(datos, { recursive: true })
const tablas = (await ro(`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).map((r) => r.table_name)
const conteos = {}
for (const t of tablas) {
  const [{ filas }] = await ro(`select coalesce(json_agg(t), '[]'::json) as filas from public."${t}" t`)
  writeFileSync(resolve(datos, `${t}.json`), JSON.stringify(filas))
  conteos[t] = filas.length
  console.log(`${t.padEnd(20)} ${filas.length}`)
}
writeFileSync(resolve(datos, '_conteos.json'), JSON.stringify(conteos, null, 2))
const [{ n }] = await ro('select count(*)::int as n from auth.users')
console.log(`auth.users (no se exporta: ver 06-usuarios.md)  ${n}`)
