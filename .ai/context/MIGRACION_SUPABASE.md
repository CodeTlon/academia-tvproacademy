# Migración Supabase + Vercel -> Coolify

Doctrina: `codetlon-cloud/.claude/modules/{coolify-compose,migracion-supabase}.md`. Principio: **invisible para el cliente y los usuarios** (mismos ids, mismos usuarios con su contraseña, mismas URLs de archivos, mismo dominio).

## Inventario (FACT, `git grep` previo a la migración)
- Tablas: `site_settings`, `posts`, `students`, `class_attendance`, `payments` (11 migraciones SQL en `supabase/migrations/`, conservadas como referencia hasta el corte).
- Auth: `auth.users` con `app_metadata.role` (`student` o ausente = admin) y `must_change_password`; sin proveedores sociales ni magic link conocidos.
- Storage: un bucket público `media` (portadas, imágenes del blog y de contenido, video y PDF subidos desde el dashboard).
- Sin Realtime, Edge Functions ni crons. Resend declarado y sin uso.

## Qué ya está hecho (rama `feature/dev2-coolify`, mergeada a `dev`)
Código sin Supabase, Drizzle + Better Auth, storage en volumen, Dockerfile/compose/health/workflows, E2E, scripts de migración en `scripts/migracion/`. Falta todo lo que toca el entorno real (ver `PENDIENTES.md`).

## Cómo se copian los datos (solo lectura sobre Supabase)
Necesita `scripts/migracion/.env.migracion` (gitignored, chmod 600) con `SUPABASE_PROJECT_REF`, `SUPABASE_URL` y `SUPABASE_ACCESS_TOKEN` (token `sbp_` de uso único, revocarlo al terminar). Pedírselo a Mateo: no se leen ni se imprimen secretos.

```
scripts/migracion/snapshot-completo.sh           # -> ~/migracion-tvpro/<fecha> (700, fuera de git)
# en la base nueva ya migrada (npm run db:migrate / arranque de la app), SNAP = carpeta del snapshot:
D="docker exec -i <db> psql -U app -d app -v ON_ERROR_STOP=1 -q"
$D < $SNAP/data/import-usuarios.sql              # primero: students.user_id referencia a user.id
$D < $SNAP/data/import.sql                       # test/dev (alumnos anonimizados); en el corte usar import-real.sql
tar -C $SNAP/storage -cf - . | docker exec -i <app> tar -C /data/storage -xf -
$D < $SNAP/reescribir-urls.sql                   # URLs de Supabase -> /media/...
$D < $SNAP/verificar-urls.sql                    # todo en 0
SNAPSHOT=$SNAP DEST_PSQL='docker exec -i <db> psql -U app -d app -tA' DEST_APP=<app> node scripts/migracion/10-verificar-paridad.mjs
node scripts/migracion/11-comparar-sitio.mjs https://tvproacademy.com.ar https://<url-test>
```

## Verificado y no verificado
- Verificado en local: hash bcrypt importado entra con su contraseña (200) y con una mala da 401; flujo admin -> alumno -> cambio de contraseña obligatorio; subida y `/media`.
- **No verificado** (necesita el token de Supabase): `snapshot-completo.sh`, el import real, `10-verificar-paridad.mjs` y `11-comparar-sitio.mjs` contra datos reales. Se escribieron por adaptación de la plantilla de gc2 (probada allá) y se revisaron a mano; correrlos primero en `test`.
- Las sesiones de Supabase dejan de valer en el corte: los usuarios tienen que volver a entrar con la misma contraseña.
