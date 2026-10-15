#!/usr/bin/env node
// Exporta los usuarios del dashboard (auth.users de Supabase, solo lectura) y genera out/data/import-usuarios.sql para la base nueva:
// un `user` y una `account` credential por usuario, con el MISMO id y el MISMO hash bcrypt, así entran con su contraseña de siempre
// (src/lib/auth.ts verifica $2a$/$2b$ con bcrypt). El rol sale de app_metadata (`student` = alumno del portal; sin rol = admin) y también `must_change_password`.
// Salida con PII y hashes de contraseña: chmod 600, fuera de git. Nunca imprime emails ni hashes.
// Uso: node 09-exportar-usuarios.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { ro, out } from './lib-supabase.mjs'

const datos = resolve(out, 'data'); mkdirSync(datos, { recursive: true })
const usuarios = await ro(`select u.id::text as id, u.email, u.email_confirmed_at, u.created_at, u.encrypted_password,
    coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', (select s.name from public.students s where s.user_id = u.id), '') as nombre,
    case when u.raw_app_meta_data->>'role' = 'student' then 'student' else 'admin' end as rol,
    coalesce((u.raw_app_meta_data->>'must_change_password')::boolean, false) as must_change,
    (select string_agg(distinct provider, ',') from auth.identities i where i.user_id = u.id) as proveedores
  from auth.users u where u.deleted_at is null and u.email is not null order by u.created_at`)
writeFileSync(resolve(datos, 'auth_users.json'), JSON.stringify(usuarios), { mode: 0o600 })

const lit = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)
const ts = (s) => (s ? `${lit(s)}::timestamptz at time zone 'UTC'` : 'now()')
const sql = ['begin;']
let sinPassword = 0
for (const u of usuarios) {
  const nombre = u.nombre || u.email.split('@')[0]
  sql.push(`insert into "user" (id, name, email, email_verified, role, must_change_password, created_at, updated_at) values (${lit(u.id)}, ${lit(nombre)}, ${lit(u.email.toLowerCase())}, ${u.email_confirmed_at ? 'true' : 'false'}, ${lit(u.rol)}, ${u.must_change ? 'true' : 'false'}, ${ts(u.created_at)}, now()) on conflict (id) do nothing;`)
  if (u.encrypted_password && /^\$2[aby]\$/.test(u.encrypted_password)) {
    sql.push(`insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at) values (${lit(randomUUID())}, ${lit(u.id)}, 'credential', ${lit(u.id)}, ${lit(u.encrypted_password)}, ${ts(u.created_at)}, now()) on conflict (id) do nothing;`)
  } else sinPassword++
}
sql.push('commit;', '')
writeFileSync(resolve(datos, 'import-usuarios.sql'), sql.join('\n'), { mode: 0o600 })
console.log(`${usuarios.length} usuarios -> out/data/import-usuarios.sql (hash bcrypt conservado en ${usuarios.length - sinPassword}; sin contraseña utilizable: ${sinPassword})`)
if (sinPassword) console.log('Los usuarios sin hash bcrypt (login social/magic link) deben usar "Olvidé mi contraseña".')
