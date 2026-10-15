# Environments

| Entorno | Rama | Dónde | Estado (2026-10-15) |
|---|---|---|---|
| dev | `dev` | local: `docker compose up -d` (Postgres) + `npm run dev` | listo; ya no apunta a la base de producción |
| test | `test` | recurso de Coolify aparte (mismo compose, base y volumen propios), dormido y se enciende a mano | **sin crear** |
| prod | `main` | hoy Vercel + Supabase (v1.x). Tras el corte: recurso de Coolify | **`main` sin tocar**: el corte lo decide y ejecuta Mateo |

## Variables (solo nombres)
`DATABASE_URL`, `BETTER_AUTH_SECRET` (distinto por entorno, >= 32 caracteres), `BETTER_AUTH_URL`, `STORAGE_DIR`, `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_GA_ID` (estas dos entran en el build). En Coolify la contraseña de Postgres la genera la plataforma (`SERVICE_PASSWORD_POSTGRES`). No hay correo transaccional hoy (no se usa Resend).

## Workflows (`.github/workflows/`)
- `ci.yml`: tsc, sin `next/font/google`, build, `npm audit --omit=dev --audit-level=high`, E2E en 3 viewports con Postgres de servicio.
- `entornos.yml`: push a `test` -> si `TEST_URL` esta definida y el recurso encendido, espera el deploy por `started_at` y corre E2E contra test.
- `produccion.yml` y `backup-check.yml`: de la plantilla; **no activar hasta el corte** (requieren `PRODUCCION_HABILITADA`, `PROD_URL`, el Environment `prod-coolify` y la clave de lectura de B2).

## Backups
Scripts copiados en `scripts/backup/` (de la fábrica; sin probar contra B2 real). Falta (obligatorio antes de cargar datos reales): cron en el VPS, `FILES_MODE=volume` y simulacro de restauración fechado. Ver `docs/BACKUPS.md` en `codetlon-cloud`.
