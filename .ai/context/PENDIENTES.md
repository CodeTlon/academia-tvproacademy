# Pendientes (los que son de Mateo, Regla de Oro #7, y los que siguen en el código)

## De Mateo (infra y credenciales)
1. Coolify: crear el recurso `tvpro-test` (Docker Compose, repo `CodeTlon/academia-tvproacademy`, rama `test`, Compose Location `/docker-compose.coolify.yml`, dominio en el servicio `app` puerto 3000). Variables: `BETTER_AUTH_SECRET` (distinto), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`. Esperar `db` y `app` healthy y `/api/health` 200.
2. Dar el token de la Management API de Supabase (solo lectura, `sbp_`) para correr el snapshot; revocarlo después.
3. Ensayo en `test` con alumnos anonimizados: import, archivos, paridad, login real con un usuario de cada rol.  Los admins llegan con el import de usuarios (la imagen no trae `crear-usuario`).
4. Backup a B2 (script + cron en el VPS) y simulacro de restauración antes de cargar datos reales.
5. Recurso `tvpro-prod`, corte en ventana de bajo tráfico, DNS (`A` de raíz y `www`, sin tocar MX/TXT), Supabase en solo lectura 1-2 semanas, baja de Supabase y de Vercel.
6. PR de `test` a `main` y merge: solo con OK explícito de Mateo (despliega producción).

## En el código
- `npm audit`: 0 altas; quedan 4 moderadas de herramientas de dev (drizzle-kit/esbuild).
- Sin `eslint` en el proyecto (no lo había): decidir si se suma.
- Decidir qué hacer con `supabase/migrations/` tras el corte (hoy referencia para la paridad).
