# CURRENT_STATE.md

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
