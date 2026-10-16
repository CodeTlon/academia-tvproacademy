# AGENTS.md — academia-tvproacademy

> ⚠️ **Proyecto en producción real** (tvproacademy.com.ar). Hay una academia real, alumnos reales, pagos reales.
>
> **`main` sigue en v1.x (Vercel + Supabase) hasta el corte; NO se toca `main`.** El trabajo de migración vive en `dev` / `test`
> (flujo `feature/*` -> `dev` -> `test` -> PR a `main`, y a `main` solo con OK explícito de Mateo). Desde la v2.0.0 el desarrollo
> local usa su propia base (`docker compose up -d`): ya no pega contra producción. Aun así, no corras nada contra la base o
> los archivos de producción sin confirmación. Antes de asumir cómo se despliega algo, leé
> [`.ai/context/ENVIRONMENTS.md`](.ai/context/ENVIRONMENTS.md) y [`.ai/context/PENDIENTES.md`](.ai/context/PENDIENTES.md).

## Qué es esto

Sitio + panel de administración + portal de alumnos para TV Pro Academy (academia de fútbol,
Córdoba, Argentina). Reemplaza un cuaderno físico de asistencia y pagos. Detalle completo en
[`.ai/context/PROJECT.md`](.ai/context/PROJECT.md).

## Stack

- **Next.js 16.4.2** (App Router, `output: 'standalone'`), React 19.3.1, TypeScript 6. Node 22. Versiones de la flota: `codetlon-cloud/.claude/modules/stack-versions.md`.
- **Postgres + Drizzle ORM** (`src/db/schema.ts`, migraciones en `drizzle/`) + **Better Auth** (email y contraseña, sin registro público).
  Sin backend aparte: la lógica de servidor son Server Actions (`src/actions/*.ts`) y unos pocos route handlers
  (`api/auth`, `api/health`, `api/upload`, `media`).
- Archivos en volumen (`STORAGE_DIR`), servidos por `/media/[...ruta]`. Tailwind 4 (tokens en `@theme` de `src/app/globals.css`), Tiptap, `isomorphic-dompurify`, `sharp`, Zod.
- Deploy: Coolify con `docker-compose.coolify.yml` (app + Postgres + volúmenes). `main` todavía despliega en Vercel hasta el corte.

## Comandos

```bash
npm install
docker compose up -d       # Postgres local
npm run db:migrate         # aplica drizzle/*.sql (DATABASE_URL en .env.development.local)
npm run dev                # localhost:3000
npm run build
npx tsc --noEmit           # correrlo SIEMPRE antes de push
npm run test:e2e           # Playwright, 3 viewports (el flujo admin/alumno pide E2E_ADMIN_EMAIL/PASSWORD)
npx tsx --env-file=.env.development.local scripts/crear-usuario.mts <email> <nombre> admin
```

CI (`.github/workflows/ci.yml`): tsc, build, `npm audit`, E2E con Postgres. ESLint 10 existe (`npm run lint`, config plana, reglas nuevas de React como aviso); no hay tests unitarios.

## Convenciones críticas

1. **Preferí Server Actions para la lógica de servidor** (`src/actions/<algo>.ts` con `'use server'` al tope);
   los route handlers (`src/app/api/`) son solo para auth, health, subida de archivos y `/media`.
2. **Toda Server Action que escribe datos empieza con `requireAdmin()` / `requireUser()` /
   `requireStudent()`** (de `src/lib/session.ts`), incluso si la ruta ya está protegida por
   `guardPage()` del layout. No hay RLS: esta guarda ES la autorización. `src/proxy.ts` (antes `middleware.ts`, Next 16) solo es un redirect optimista.
3. **El rol vive en `user.role` y `user.must_change_password`, y solo los escribe el servidor** (`input: false` en `src/lib/auth.ts`;
   se asignan con `internalAdapter` o con `db`). Nunca aceptes un rol que venga del cliente (fue una vulnerabilidad real en v1.x, ver `DECISIONS.md`).
4. Todo HTML que venga del editor Tiptap se sanitiza con `sanitizePostContent`
   (`src/lib/sanitize-html.ts`) **en dos puntos**: al guardar (server action) y al servir
   (`dangerouslySetInnerHTML` en la página pública del blog). Si agregás un campo nuevo con HTML
   libre, replicá ese patrón — no confíes en un solo punto de sanitización.
5. Errores de Postgres nunca se muestran crudos al usuario — pasan por
   `friendlyError()` (`src/lib/friendly-error.ts`) primero.
6. Formularios del dashboard: `useActionState` + una server action bindeada con `.bind(null, id)`
   cuando hace falta un id fijo (ver `StudentForm.tsx` como referencia). `revalidatePath()`
   después de cada mutación exitosa.
7. `site_settings` es la fuente de verdad del contenido público editable; su fallback en código
   (`src/lib/site-config.ts`) se deriva 1:1 — si agregás una key nueva a `site-config.ts`,
   agregala también al `FALLBACK` de `src/lib/site-settings.ts` para que no diverjan.

## Para más contexto

| Necesitás... | Leé |
|---|---|
| Entender qué hace el proyecto y para quién | [`.ai/context/PROJECT.md`](.ai/context/PROJECT.md) |
| Tocar auth, roles, RLS, o cualquier Server Action | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) + [`.ai/context/KNOWN_ISSUES.md`](.ai/context/KNOWN_ISSUES.md) |
| Tocar el panel de alumnos (asistencia, pagos, vencimientos) | [`.ai/context/DOMAIN.md`](.ai/context/DOMAIN.md) |
| Tocar contenido público (hero, nosotros, servicios, blog) | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) — sección `site_settings` |
| Deploy, ambientes, infraestructura | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) — sección "Cadena de deploy" |
| Por qué algo está hecho como está hecho | [`.ai/context/DECISIONS.md`](.ai/context/DECISIONS.md) |
| Qué falta, qué es riesgoso, por qué | [`.ai/context/KNOWN_ISSUES.md`](.ai/context/KNOWN_ISSUES.md) |
| Convenciones de código (naming, estructura, patrones) | [`.ai/context/CONVENTIONS.md`](.ai/context/CONVENTIONS.md) |
| Preguntas sin resolver que necesitan al usuario | [`.ai/context/OPEN_QUESTIONS.md`](.ai/context/OPEN_QUESTIONS.md) |

Ver también [`.ai/context/00_INDEX.md`](.ai/context/00_INDEX.md) para el índice completo.
