# CURRENT_STATE.md

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
