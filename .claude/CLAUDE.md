# academia-tvproacademy — memoria de sesion

> Contexto estable: `AGENTS.md` y `.ai/context/00_INDEX.md`. Este archivo guarda lo que cambia sesion a sesion (avisos, quirks, historial).

## Aviso
Proyecto en produccion real (tvproacademy.com.ar). `main` sigue en v1.x (Vercel + Supabase) hasta el corte: **no se toca `main`** sin OK de Mateo. Flujo: `feature/*` -> `dev` -> `test` (merge directo) -> PR a `main`.

## Stack vigente (2026-10-16)
Next 16.4.2, React 19.3.1, TypeScript 6.0.3, Tailwind 4.3.3, ESLint 10.13.0, Zod 4.6.7, Better Auth 1.7.10, Drizzle, Postgres 17, Node 22. Fuente de versiones: `codetlon-cloud/.claude/modules/stack-versions.md`.

## Quirks
- `src/proxy.ts` (antes `middleware.ts`): solo redirect optimista; la autorizacion real es `require*()` en cada accion.
- Para probar la imagen Docker hay que pasar `--build-arg NEXT_PUBLIC_SITE_URL=... --build-arg STORAGE_PUBLIC_URL=...`; sin ellos falla con `Invalid URL`.
- `npm audit` completo muestra `braces` (cadena de `eslint-config-next`): es de lint y no tiene parche publicado; el gate es `npm audit --omit=dev` en 0.
- Tailwind 4: nada de clases pegadas a `${}` en plantillas, y las utilidades propias no pueden llamarse `delay-`, `duration-`, etc.

## Historial de Cambios
| Fecha | Rama | Cambio |
|-------|------|--------|
| 2026-10-16 | feature/dev2-estandar-2026 | v2.1.0 — estandar de versiones de la flota (Next 16, React 19, Tailwind 4, ESLint 10, `proxy.ts`). 25 E2E verdes (2 omitidos por diseño), audit de runtime en 0. |
| 2026-10-15 | dev/test | v2.0.0 — backend propio (Drizzle + Better Auth + archivos en volumen), Docker/Coolify, fuentes autoalojadas, E2E y CI con Postgres. |
