# ARCHITECTURE.md

Cada afirmación está etiquetada FACT (verificado contra código o ejecución real), ASSUMPTION (razonable pero no confirmado), UNKNOWN o DECISION (elección deliberada, ver `DECISIONS.md`). Actualizado 2026-10-15 (v2.0.0, migración a backend propio, rama `feature/dev2-coolify` / `dev`).

## Stack (FACT, `package.json`)

- Next.js 15.5 (App Router, `output: 'standalone'`), React 18, TypeScript 5.4, Tailwind 3.4.
- Postgres 17 + **Drizzle ORM** (`src/db/schema.ts`, migraciones SQL en `drizzle/`) + **Better Auth** 1.7.7 (email y contraseña, sin registro público).
- Archivos: volumen del servidor (`STORAGE_DIR`, `/data/storage` en el contenedor), servido por `/media/[...ruta]`.
- Tiptap 3 (editor del blog), `isomorphic-dompurify`, `sharp`, `zod`, `slugify`, `motion`, `lucide-react`. Fuentes autoalojadas con `next/font/local` (`FONTS.md`).
- Node 22. Sin Supabase ni Vercel en el código (`git grep supabase src` no devuelve código).

## Capas (FACT)

```
UI (Server/Client Component)
   -> Server Action ('use server', src/actions/*.ts)  |  Route handler (api/auth, api/health, api/upload, media)
       -> requireAdmin() / requireStudent() / requireUser()   (src/lib/session.ts, valida la sesion en el servidor)
           -> Drizzle (src/lib/db.ts) sobre Postgres
```

No hay RLS: la autorización vive en el servidor. Cada Server Action de escritura empieza con `requireAdmin()` (verificado en `students.ts`, `posts.ts`, `media.ts`, `settings.ts`). Las lecturas del panel están detrás de `guardPage()` en los layouts. `src/middleware.ts` solo hace un redirect optimista por cookie (no es una barrera de seguridad).

## Auth y roles (FACT)

- Login único (`/login`) para admin y alumno. `user.role` es `admin` o `student` y `user.must_change_password` marca la contraseña temporal. Los dos campos son `input: false` en `src/lib/auth.ts`: solo los escribe el servidor (el cliente no puede auto-escalarse).
- `guardPage('dashboard' | 'portal')` (layouts) redirige: sin sesión al login, cada rol a lo suyo y contraseña temporal sin cambiar a `/…/cambiar-password`.
- Las contraseñas de Supabase (bcrypt) siguen valiendo: `password.verify` acepta `$2a$/$2b$/$2y$` con `bcryptjs`. Las nuevas usan scrypt (default de Better Auth). Verificado con un hash bcrypt real (login 200 y contraseña mala 401).
- Alta de cuenta de alumno: `createStudentAccountAction` crea el usuario (`role: student`, `mustChangePassword: true`) y su cuenta `credential` con `internalAdapter`; el email es sintético (`nombre@tvproacademy.com.ar`). Reset: la acción obtiene el usuario desde la fila del alumno, nunca del formulario.

## Esquema de datos (FACT, `drizzle/0000_baseline.sql`)

| Tabla | Notas |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth. `user` suma `role` y `must_change_password`. |
| `site_settings` | `key` PK, `value` jsonb. Contenido público editable; se mergea sobre el fallback de `site-config.ts`. |
| `posts` | Blog. `content` es HTML sanitizado al guardar y al servir. |
| `students` | `user_id` (text, unique, FK a `user`, `on delete set null`), `email` unique, `status_override` `al_dia`/`vencido`. |
| `class_attendance` | unique `(student_id, class_date)`, `excused`, `class_time`. |
| `payments` | `paid_at`, `amount`, `classes_qty`. |

Los ids y columnas son los mismos que en Supabase, para importar los datos tal cual. Los tipos devueltos tienen el mismo formato que antes (fechas como string ISO, `numeric` como number).

## Archivos (FACT)

`src/lib/storage.ts` guarda con `putObject` (nunca pisa: la key lleva un UUID) y valida rutas (sin `..`, hasta 4 segmentos). `/media/[...ruta]` sirve solo extensiones conocidas, tipo por extensión, `nosniff`, `Range` para video y caché de un año. `/api/upload` (streaming, sesión de admin + origen + tipo + tamaño real) sube video y PDF; las imágenes pasan por `uploadImageAction` (re-encode a WebP con sharp). Probado: subida 200, tipo correcto, un alumno recibe 403, path traversal 404.

## Seguridad HTTP (FACT, `next.config.mjs`)

CSP con `unsafe-inline` en `script-src` por el script de Google Analytics, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. `connect-src` ya no incluye Supabase. `images.remotePatterns` acepta cualquier HTTPS (el admin pega URLs de imágenes).

## Despliegue (FACT en el repo, ASSUMPTION en Coolify: todavía no se creó el recurso)

`Dockerfile` (3 etapas, Node 22, usuario no root, volumen `/data/storage`) y `docker-entrypoint.sh` (valida variables, aplica migraciones y falla cerrado, arranca `server.js`). `docker-compose.coolify.yml`: `app` + `db` (postgres:17-alpine, sin puertos publicados) + volúmenes `pgdata` y `storage`. `/api/health` consulta la base y devuelve `started_at`. Ramas `feature/*` -> `dev` -> `test` -> `main`; hasta el corte, `main` sigue desplegando en Vercel contra Supabase (ver `ENVIRONMENTS.md` y `PENDIENTES.md`).

## Migración de datos

`scripts/migracion/` (de la plantilla de la fábrica, adaptado a estas tablas): ver `MIGRACION_SUPABASE.md`.
