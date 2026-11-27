# CURRENT_STATE.md

**Corte a Coolify, 2026-11-27 (hecho):** producción corre en Coolify (`tvpro-prod`, rama `main`) con Postgres propio, Better Auth y archivos en volumen; ya no usa Supabase ni Vercel.
- **Datos:** migrados dentro del contenedor (`scripts/migracion/en-contenedor.mjs`), con reimport `corte-2` justo antes del DNS. Paridad OK: 27 alumnos, 18 pagos, 83 asistencias, 5 posts, 7 settings, 1 usuario con su hash bcrypt y 2 archivos con sha256 idéntico.
- **Aspecto:** comparado contra Vercel con el dominio real (8 páginas, desktop y mobile), con diferencias de píxeles de 0,1 % o menos; para eso se igualaron la Montserrat de Google y los line-height de Tailwind 3.
- **DNS:** A de raíz y `www` a 51.91.253.54 en Cloudflare, sin proxy. Certificados de Let's Encrypt emitidos por Traefik; la primera emisión falló porque el recurso se desplegó antes del cambio de DNS, y se resolvió reiniciando la app.
- **Test:** https://test.tvproacademy.com.ar, con noindex (`robots` disallow + `X-Robots-Tag`) fuera de producción.
- **Vercel:** quedó sin deploys desde git (`vercel.json`).
- **Supabase:** queda vivo como respaldo 1 a 2 semanas y después se da de baja.
- **Sesiones:** el único usuario (admin) tiene que volver a iniciar sesión con su contraseña de siempre.
- **Pendiente obligatorio:** backups a B2 con prueba de restauración (`docs/BACKUPS.md` de codetlon-cloud); necesita acceso al servidor de Coolify.

**Actualizacion 2026-11-27:** `isomorphic-dompurify` → `sanitize-html`, misma lista blanca e iframes solo de YouTube; viene del fix de `main` (PR #7), donde jsdom no cargaba en Vercel y el blog daba 500. Verificado: 9 vectores de XSS, tsc, lint (7 avisos previos), build (2 avisos previos de `storage.ts`) y `npm audit --omit=dev` en 0. Produccion (`main`, Vercel + Supabase) tiene ademas Next 16.4.6 desde el hotfix #2/#4, y el 2026-11-27 se restauraron en Supabase los 5 articulos del seed de `posts`.

**Actualizacion 2026-11-26:** Next 16.4.2 → 16.4.6 por advisories de seguridad (rama `feature/dev1-next-16-4-6`, promovida a `dev` y `test`; `main` sin tocar). Verificado: tsc, lint (7 avisos, los mismos que en `dev`) y build; `npm audit --omit=dev` en 0. E2E en la CI.

**Actualizacion 2026-10-16:** la rama `feature/dev2-estandar-2026` (integrada en `dev` y `test`) lleva el proyecto al estandar de versiones de la flota: Next 16.4.2, React 19.3.1, Tailwind 4.3.3, TypeScript 6.0.3, ESLint 10.13.0 (nuevo), `proxy.ts`. Verificado: `tsc`, lint (0 errores), build, E2E (25 pasan, 2 omitidos por diseño; 3 viewports, con el flujo admin a alumno), imagen Docker Alpine, `npm audit --omit=dev` en 0. **Sin verificar:** despliegue en Coolify (sin recursos), scripts de migracion contra Supabase real. `main` sigue en v1.x.

Snapshot al 2026-10-15. Se desactualiza: confirmá con `git log -5` y `git branch -r`.

## Ramas
- `main`: **v1.x en producción** (Vercel + Supabase, https://tvproacademy.com.ar). No se tocó.
- `dev` y `test`: creadas el 2026-10-15 desde `main`. `dev` recibe la migración (v2.0.0).
- `feature/dev2-coolify`: rama de trabajo de la migración.

## Qué hay en v2.0.0 (`dev`)
Sitio, dashboard, blog, alumnos (asistencia, pagos, acceso al portal) y portal: mismo comportamiento, sobre Drizzle + Better Auth + archivos en volumen. Dockerfile, compose de Coolify, health, CI con Postgres, E2E en 3 viewports (25 pasaron en local, 2 saltados por diseño), fuentes autoalojadas, `npm audit` en 0 altas, scripts de migración de datos.

## Qué falta
Ver `PENDIENTES.md`: recursos de Coolify, ensayo con datos reales anonimizados en `test`, backup B2 con simulacro, corte y baja de Supabase/Vercel. La imagen Docker se probó en local contra Postgres real: migra al arrancar, `/api/health` 200, corre como usuario no root, 25 E2E pasan contra el contenedor (login con hash bcrypt incluido) y los archivos subidos sobreviven un reinicio.

## No implementado (nunca se construyó)
Envío de email (Resend se quitó del compose; sigue en `package.json` sin uso), ESLint.
