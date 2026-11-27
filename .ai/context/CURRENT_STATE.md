# CURRENT_STATE.md

**Actualización 2026-11-26 (hotfix de seguridad sobre `main`, rama `feature/dev1-hotfix-next-main`):** Next 15.5 → 16.4.6 y React 18 → 19 (advisories críticos de Next ≤16.3, entre ellos RCE en el optimizador de imágenes con SVG y envenenamiento de caché SSG/ISR), `npm audit fix` de postcss, sharp, undici, zod y dompurify. `src/middleware.ts` pasa a `src/proxy.ts` (convención de Next 16, misma lógica). Sigue en Vercel + Supabase: la migración a backend propio queda en `dev`/`test` (PR #1 abierto hasta el corte). Verificado: tsc, build sin avisos, `npm audit --omit=dev` en 0 y prueba con `next start` (`/`, `/login`, `/blog` 200; `/dashboard` y `/portal` redirigen a `/login`). **Problema previo en producción:** `/blog` muestra la lista vacía y cualquier `/blog/<slug>` responde 500, también con Next 15.5 (se revirtió el hotfix, PR #3, y siguió igual; se volvió a aplicar). Causa (2026-11-26): la tabla `posts` de Supabase está **vacía** (los 5 artículos del seed de `supabase/migrations/002_posts.sql` se borraron; el resto de las tablas tiene datos: 27 alumnos, 18 pagos, 83 asistencias). Por eso `/blog` no muestra artículos. Aparte, en Vercel un slug inexistente da 500 en vez de 404 (en local da 200 con la página de no encontrado); no se pudo ver el log. Restaurados el 2026-11-27 con el seed (REST de Supabase, `on_conflict=slug`, ignorando duplicados). **Causa del 500 en `/blog/<slug>`:** `isomorphic-dompurify` carga jsdom 29, que requiere Node ^20.19 / ^22.13; con el Node viejo de Vercel corta al importar el módulo (`ERR_REQUIRE_ESM` de `@exodus/bytes`), por eso fallaba cualquier slug. Se fija `"engines": { "node": "22.x" }` en `package.json`.

Snapshot al 2026-09-18. **Esto se desactualiza rápido — si pasó más de un par de semanas desde
esta fecha, confirmá con `git log -5` y `vercel ls` antes de confiar en algo de acá.**

## Último estado conocido de producción

- Último commit en `main`: `a4cfe30` ("fix: migracion 010 tambien usa app_metadata (no
  user_metadata), mismo criterio que 011") — 2026-09-03.
- Deploy de producción correspondiente: `dpl_CJH4bjhKH1nduGLWJ9WSb8ukVqgq`, Ready, creado
  2026-09-03T16:06:19, alias activo en `tvproacademy.com.ar` / `www.tvproacademy.com.ar`.
- 14 días sin nuevos commits al momento de este snapshot — el trabajo más reciente fue
  exclusivamente la tanda de fixes de seguridad `app_metadata` (ver `DECISIONS.md`), ya en
  producción y funcionando (sin reportes de acceso indebido posteriores, según lo que se pudo
  verificar en esta sesión — no se revisaron logs de Supabase Auth más allá de esto).

## Qué está completo y en uso real

- Sitio público completo (home, nosotros, entrenamiento, blog con 5 artículos reales, contacto).
- Dashboard admin: gestión de contenido (hero, nosotros, servicios, instalaciones, metodología,
  negocio), blog (CRUD + editor Tiptap), alumnos (alta, edición, asistencia, pagos, alta/reset de
  acceso al portal).
- Portal de alumnos: vista de solo lectura del propio estado de cuenta.
- Auth: login único, cambio de contraseña obligatorio en primer login, RLS + Server Actions +
  middleware en las tres capas para todo lo anterior.

## Qué NO está implementado (no es que esté roto, nunca se construyó)

- Envío de email real (Resend está declarado, sin call site).
- Ambiente de staging separado (dev local = prod, ver `KNOWN_ISSUES.md`).
- Tests, lint, CI (ver `CONVENTIONS.md`/`KNOWN_ISSUES.md`).

## Documentación desactualizada conocida

`README.md` (raíz del repo) describe el proyecto como el "CodeTlon Demo Template" genérico
("solo hay un archivo que tocar: `src/lib/demo-config.ts`") — ese archivo y ese patrón ya no
existen, fueron reemplazados por `site_settings` + Supabase (ver `ARCHITECTURE.md`). No se
reescribió como parte de esta tarea de context engineering (es código/documentación de producto,
no `.ai/context/`) — queda como tarea pendiente si el usuario la pide.
