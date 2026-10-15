# TV Pro Academy

Sitio público, panel de administración y portal de alumnos de TV Pro Academy (academia de fútbol, Córdoba, Argentina). Reemplaza un cuaderno físico de asistencia y pagos.

Producción: https://tvproacademy.com.ar

## Stack

Next.js 15.5 (App Router, `output: 'standalone'`), React 18, TypeScript, Tailwind. Backend propio: Postgres + Drizzle ORM + Better Auth (email y contraseña), archivos en un volumen servido por `/media`. Se despliega en Coolify con `docker-compose.coolify.yml` (app + Postgres + volumen). Sin Supabase ni Vercel desde la v2.0.0 (ver Changelog).

## Desarrollo local

Requiere Node 22 y Docker.

```bash
npm install
docker compose up -d                     # Postgres local en 127.0.0.1:5432
cp .env.example .env.development.local   # completar BETTER_AUTH_SECRET: openssl rand -base64 32
npm run db:migrate                       # aplica drizzle/*.sql
npx tsx --env-file=.env.development.local scripts/crear-usuario.mts admin@ejemplo.com "Nombre" admin
npm run dev                              # http://localhost:3000
```

`type-check` y los tests antes de cada push:

```bash
npx tsc --noEmit
npm run test:e2e        # E2E con Playwright (3 viewports); el flujo admin/alumno necesita E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD
```

## Ramas y entornos

`feature/*` -> `dev` -> `test` -> `main`. `dev` y `test` se mergean directo; solo `main` va por pull request y despliega producción. `test` es un recurso de Coolify aparte, dormido, que se enciende a mano para probar. Detalle en [`.ai/context/ENVIRONMENTS.md`](.ai/context/ENVIRONMENTS.md).

## Documentación para sesiones de IA y mantenimiento

[`AGENTS.md`](AGENTS.md) y [`.ai/context/`](.ai/context/00_INDEX.md): arquitectura, decisiones, estado actual, problemas conocidos y pendientes de la migración.

## Changelog

| Versión | Cambio |
|---|---|
| 2.0.0 (en `dev`, sin llegar a `main`) | Migración a backend propio: Drizzle + Better Auth + archivos en volumen, Dockerfile y compose de Coolify, fuentes autoalojadas, E2E y CI con Postgres, scripts de migración de datos desde Supabase (`scripts/migracion/`). `main` sigue en Vercel + Supabase hasta el corte. |
| 1.x | Sitio, dashboard, portal de alumnos y blog sobre Supabase + Vercel. |

## Licencia

Software propietario (all-rights-reserved), ver [`LICENSE`](LICENSE). `"license": "UNLICENSED"` en `package.json`.
