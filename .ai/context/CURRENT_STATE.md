# CURRENT_STATE.md

Snapshot al 2026-10-15. Se desactualiza: confirmá con `git log -5` y `git branch -r`.

## Ramas
- `main`: **v1.x en producción** (Vercel + Supabase, https://tvproacademy.com.ar). No se tocó.
- `dev` y `test`: creadas el 2026-10-15 desde `main`. `dev` recibe la migración (v2.0.0).
- `feature/dev2-coolify`: rama de trabajo de la migración.

## Qué hay en v2.0.0 (`dev`)
Sitio, dashboard, blog, alumnos (asistencia, pagos, acceso al portal) y portal: mismo comportamiento, sobre Drizzle + Better Auth + archivos en volumen. Dockerfile, compose de Coolify, health, CI con Postgres, E2E en 3 viewports (25 pasaron en local, 2 saltados por diseño), fuentes autoalojadas, `npm audit` en 0 altas, scripts de migración de datos.

## Qué falta
Ver `PENDIENTES.md`: recursos de Coolify, ensayo con datos reales anonimizados en `test`, backup B2 con simulacro, corte y baja de Supabase/Vercel. La imagen Docker se probó en local (ver `KNOWN_ISSUES.md` si algo quedó sin verificar).

## No implementado (nunca se construyó)
Envío de email (Resend se quitó del compose; sigue en `package.json` sin uso), ESLint.
