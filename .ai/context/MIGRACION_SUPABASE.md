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
**Vía usada (2026-11-27): dentro del contenedor, sin entrar al servidor.** Con `MIGRAR_DESDE_SUPABASE=1` en las variables del recurso de Coolify, `docker-entrypoint.sh` corre `scripts/migracion/en-contenedor.mjs` antes de levantar la app. Solo actúa si la base nueva no tiene usuarios ni alumnos. Lee Supabase por el pooler de sesión (`SUPABASE_DB_URL`, IPv4, `aws-0-us-east-2.pooler.supabase.com:5432`, usuario `postgres.<ref>`), con cada consulta en una transacción `READ ONLY`. Arma el snapshot en `/tmp` (07, 09, 05, 08), aplica usuarios, datos y reescritura de URLs en una transacción, copia los archivos al volumen, verifica la paridad (10) y borra el snapshot. El resultado se ve en los logs de la app (`[migracion]`). `MIGRAR_DATOS_REALES=1` carga los alumnos sin anonimizar (solo prod). Después del import, borrar `MIGRAR_DESDE_SUPABASE` y `SUPABASE_DB_URL` del recurso.
Probado en local (Docker con la imagen real, Postgres descartable): 83 asistencias, 18 pagos, 5 posts, 7 settings, 27 alumnos, 1 usuario (hash idéntico) y 2 archivos con sha256 idéntico; `PARIDAD OK`. El reinicio no reimporta. Login con un hash bcrypt `$2a$`: 200 (y 401 con contraseña incorrecta). `11-comparar-sitio` contra producción: igual salvo el banner de cookies (sin GA en local). El objeto `hero/test-1785516171608.txt` (11 bytes, subida de prueba sin referencias) se omite.

`MIGRAR_REEMPLAZAR=<etiqueta>` vacía la base (datos, usuarios y sesiones) y vuelve a importar una sola vez por etiqueta: se usa para re-sincronizar justo antes del cambio de DNS. Cada import queda en la tabla `_migracion_supabase`.
`vercel.json` con `git.deploymentEnabled: false`: al mergear `test` a `main`, Vercel no despliega el código nuevo, que no tiene base en Vercel. Producción sigue sirviendo el último deploy de Vercel hasta que el DNS apunte a Coolify.

Vía original, con token de la Management API:
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
