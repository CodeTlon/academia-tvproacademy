# Environments

| Entorno | Rama | Dónde | Estado (2026-10-15) |
|---|---|---|---|
| dev | `dev` | local: `docker compose up -d` (Postgres) + `npm run dev` | listo; ya no apunta a la base de producción |
| test | `test` | Coolify `tvpro-test` (proyecto `TV Pro Academy`), https://test.tvproacademy.com.ar, base y volumen propios, alumnos anonimizados, noindex | activo desde 2026-11-27 |
| prod | `main` | Coolify `tvpro-prod` (proyecto `TV Pro Academy`), https://tvproacademy.com.ar y www, DNS en Cloudflare (A 51.91.253.54, sin proxy) | **en producción desde 2026-11-27** (antes Vercel + Supabase) |

## Variables (solo nombres)
`DATABASE_URL`, `BETTER_AUTH_SECRET` (distinto por entorno, >= 32 caracteres), `BETTER_AUTH_URL`, `STORAGE_DIR`, `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_GA_ID` (estas dos entran en el build). En Coolify la contraseña de Postgres la genera la plataforma (`SERVICE_PASSWORD_POSTGRES`). No hay correo transaccional hoy (no se usa Resend).

## Workflows (`.github/workflows/`)
- `ci.yml`: tsc, sin `next/font/google`, build, `npm audit --omit=dev --audit-level=high`, E2E en 3 viewports con Postgres de servicio.
- `entornos.yml`: push a `test` -> si `TEST_URL` esta definida y el recurso encendido, espera el deploy por `started_at` y corre E2E contra test.
- `produccion.yml` y `backup-check.yml`: de la plantilla; **no activar hasta el corte** (requieren `PRODUCCION_HABILITADA`, `PROD_URL`, el Environment `prod-coolify` y la clave de lectura de B2).

## Backups
Scripts copiados en `scripts/backup/` (de la fábrica; sin probar contra B2 real). Falta (obligatorio antes de cargar datos reales): cron en el VPS, `FILES_MODE=volume` y simulacro de restauración fechado. Ver `docs/BACKUPS.md` en `codetlon-cloud`.

## Backups

Desde 2026-11-27 el servicio `backup` del `docker-compose.coolify.yml` hace cada día `pg_dump -Fc` de la base y un tar.gz del volumen `storage`, con `.sha256`, y los sube a `b2:backups-codetlon/prod/<BACKUP_PROJECT>/{postgres,files}/<AAAA-MM-DD>/` (mismo formato que `backup-coolify.sh` de codetlon-cloud). Se activa solo con las variables del recurso `B2_KEY_ID`, `B2_APP_KEY` y `BACKUP_PROJECT` (en test quedan vacías y no respalda); la hora va en `BACKUP_HORA_UTC`. El resultado se ve en los logs del servicio `backup` (líneas `[backup]`). La retención la aplica el bucket.
