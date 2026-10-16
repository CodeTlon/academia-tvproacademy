# ARCHITECTURE — TV Pro Academy

Mapa para mantenimiento, vigente al 2026-10-16. El detalle fino esta en `.ai/context/` (empezar por `00_INDEX.md`). No releas el repo entero: busca tu tipo de cambio abajo.

## Stack
Next.js 16.4.2 (App Router, `output: 'standalone'`) · React 19.3.1 · TypeScript 6 · Tailwind 4 (tokens en `@theme` de `src/app/globals.css`) · Postgres 17 + Drizzle ORM · Better Auth 1.7.10 · archivos en volumen (`STORAGE_DIR`, servidos por `/media`) · Tiptap 3 · Zod 4. Node 22. Se despliega en Coolify con `docker-compose.coolify.yml`.

## Capas
UI (Server/Client Component) -> Server Action (`src/actions/*.ts`) o route handler (`api/auth`, `api/health`, `api/upload`, `media`) -> `requireAdmin()` / `requireUser()` / `requireStudent()` (`src/lib/session.ts`) -> Drizzle (`src/lib/db.ts`) sobre Postgres. No hay RLS: esa guarda es la autorizacion. `src/proxy.ts` solo hace un redirect optimista por cookie.

## Estructura
- `src/app/` — publico (`/`, `nosotros`, `entrenamiento`, `blog`, `contacto`), `login`, `dashboard/(auth|panel)` (administracion), `portal/(auth|panel)` (alumnos), `api/`, `media/`, `sitemap.ts`, `robots.ts`.
- `src/actions/` — mutaciones: `auth`, `students`, `posts`, `settings`, `media`.
- `src/lib/` — `auth.ts`, `session.ts`, `db.ts`, `storage.ts` (+ `storage/`), `site-settings.ts` y `site-config.ts` (contenido editable y su fallback), `sanitize-html.ts`, `friendly-error.ts`, `upload-limits.ts`.
- `src/db/schema.ts` y `drizzle/` — esquema y migraciones SQL (se aplican al arrancar, fallan cerrado).
- `scripts/` — `migrate.mts`, `crear-usuario.mts`, `backup/`, `migracion/` (importador desde Supabase, solo lectura).
- `tests/e2e/` — Playwright en 3 viewports; el flujo admin a alumno pide `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

## Para cambios comunes
| Querés cambiar… | Abri |
|---|---|
| Contenido publico editable | `src/lib/site-settings.ts` (`FALLBACK` debe seguir 1:1 a `site-config.ts`) y `src/actions/settings.ts` |
| Alumnos, asistencia, pagos | `src/actions/students.ts`, `src/lib/students.ts`, `.ai/context/DOMAIN.md` |
| Blog | `src/actions/posts.ts` y `sanitizePostContent` en `src/lib/sanitize-html.ts` (se sanitiza al guardar **y** al servir) |
| Roles o guardas | `src/lib/auth.ts` (rol solo lo escribe el servidor), `src/lib/session.ts`, `src/proxy.ts` |
| Esquema | `src/db/schema.ts` + `npx drizzle-kit generate` (se versiona el SQL de `drizzle/`; nunca editar una migracion aplicada) |
| Estilos y utilidades | `src/app/globals.css` (`@theme`, `@utility`); las utilidades propias no pueden llamarse como las nativas de Tailwind 4 |
| Subida y servido de archivos | `src/app/api/upload`, `src/app/media/[...ruta]`, `src/lib/storage.ts` |

## Dónde no meterse sin pensar
- Nunca aceptar un rol que venga del cliente (fue una vulnerabilidad real en v1.x).
- No volver a `middleware.ts`: en Next 16 el archivo es `proxy.ts`.
- Un `ARG NEXT_PUBLIC_*` vacio llega como `""`: usar `||` y no `??` para los valores por defecto (si no, `new URL('')` rompe el build de la imagen).
