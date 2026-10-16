# KNOWN_ISSUES.md

## Vigente (2026-10-16)
- `npm audit` completo conserva 5 altas de herramientas de desarrollo: `braces` <= 3.0.3 via `eslint-config-next` -> `fast-glob` -> `micromatch`. Sin version corregida publicada; no entra al runtime (`npm audit --omit=dev` = 0).
- ESLint se incorporo el 2026-10-16: 7 avisos (`react-hooks/set-state-in-effect`). Todavia no esta en el CI.
- Los scripts `test:db` y `test:storage` se quitaron: apuntaban a archivos inexistentes. No hay tests unitarios, solo E2E.
- Con Tailwind 4 la home de escritorio difiere ~1 % en pixeles de la version anterior (sin cambio visible apreciable).

Verificado en la sesión del 2026-10-15 (migración a backend propio).

## ALTA
### 1. Producción (`main`) sigue en Supabase + Vercel hasta el corte
Mientras no se haga el corte, cualquier fix urgente en producción va sobre `main` (v1.x) y hay que traerlo a `dev` para no perderlo. Los esquemas deben seguir iguales: si se agrega una columna en Supabase, replicarla en `src/db/schema.ts` y generar migración (`npm run db:generate`).

### 2. Sin backup propio todavía
La base nueva no tiene backup B2 ni simulacro de restauración. No se cargan datos reales ni se enciende prod sin eso (`PENDIENTES.md` #4).

## MEDIA
### 3. Scripts de migración sin probar contra Supabase real
Adaptados de la plantilla de gc2 y revisados a mano; el import SQL y la paridad no se corrieron con datos reales (falta el token). Ver `MIGRACION_SUPABASE.md`.

### 4. Repositorio de GitHub público con código propietario
`CodeTlon/academia-tvproacademy` es público (visible el historial de la vulnerabilidad `user_metadata` ya parchada). Sin secretos. Decisión de Mateo si pasa a privado (`OPEN_QUESTIONS.md` #1).

### 5. Rate limit de login en memoria
Better Auth limita intentos en memoria del proceso (10 por 5 minutos en `/sign-in/email`). Con una sola réplica alcanza; con más, mover a la base.

## BAJA
- `npm audit`: 4 moderadas en herramientas de dev (drizzle-kit/esbuild), sin impacto en runtime.
- Ausencia justificada: el código la descuenta del ciclo, contradiciendo un comentario viejo (`OPEN_QUESTIONS.md` #4).
- `images.remotePatterns` acepta cualquier HTTPS (deliberado, solo el admin pega URLs).
- `resend` sigue en `package.json` sin uso.
