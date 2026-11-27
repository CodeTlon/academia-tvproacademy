# Pendientes (los que son de Mateo, Regla de Oro #7, y los que siguen en el código)

## De Mateo (infra y credenciales)
1. ~~Coolify: crear el recurso `tvpro-test`~~ **Hecho 2026-11-27** (dev1, por API): proyecto `TV Pro Academy` (uuid `aq89mxywbysxi9qf7i6k8agj`), app `tvpro-test` (uuid `jeropctlve0vm5ifupt2bxve`), rama `test`, `/docker-compose.coolify.yml`, dominio https://tvpro-test.51.91.253.54.sslip.io (sin DNS propio). Variables: `BETTER_AUTH_SECRET` propio, `NEXT_PUBLIC_SITE_URL` y `SERVICE_URL_APP`/`SERVICE_FQDN_APP` alineados al dominio, sin GA. Primer deploy (a3ad28b): `db` y `app` healthy, `/api/health` 200, rutas públicas 200, `/dashboard` y `/portal` redirigen a `/login`, slug inexistente 404. Base vacía (sin datos importados).
2. ~~Dar el token de la Management API de Supabase~~ No hizo falta: la migración lee por el pooler de sesión con la contraseña de la base (2026-11-27). (solo lectura, `sbp_`) para correr el snapshot; revocarlo después.
3. ~~Ensayo en `test`~~ **Hecho 2026-11-27** (paridad OK, alumnos anonimizados). Ensayo en `test` con alumnos anonimizados: import, archivos, paridad, login real con un usuario de cada rol.  Los admins llegan con el import de usuarios (la imagen no trae `crear-usuario`).
4. Backup a B2 (script + cron en el VPS) y simulacro de restauración antes de cargar datos reales.
5. ~~Recurso `tvpro-prod`, corte y DNS~~ **Hecho 2026-11-27**. Faltan: Supabase en solo lectura y baja en 1-2 semanas, y baja de Vercel. Recurso `tvpro-prod`, corte en ventana de bajo tráfico, DNS (`A` de raíz y `www`, sin tocar MX/TXT), Supabase en solo lectura 1-2 semanas, baja de Supabase y de Vercel.
6. ~~PR de `test` a `main`~~ **Hecho** (PR #1, con OK de Mateo). PR de `test` a `main` y merge: solo con OK explícito de Mateo (despliega producción).

## En el código
- `npm audit`: 0 altas; quedan 4 moderadas de herramientas de dev (drizzle-kit/esbuild).
- Sin `eslint` en el proyecto (no lo había): decidir si se suma.
- Decidir qué hacer con `supabase/migrations/` tras el corte (hoy referencia para la paridad).
