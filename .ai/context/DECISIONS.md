# DECISIONS.md

## `app_metadata` para roles, no `user_metadata` (DECISION, con historia de seguridad real)

**Qué se decidió**: el rol (`'student'` o admin), `student_id`, y `must_change_password` se leen
y escriben en `user.app_metadata`, nunca en `user.user_metadata`.

**Por qué (historia completa, FACT — migraciones 010/011 + commits `1aa7c41`, `b562af9`,
`695175d`, `42c68ad`, `a4cfe30`, todos ya en producción hace ~14 días)**:

1. La versión original (migración 009, "portal de alumnos") guardaba el rol en `user_metadata` y
   las policies RLS lo leían de ahí. El problema: `user_metadata` es editable por el propio
   usuario logueado, sin pasar por `service_role`, con una llamada directa a
   `supabase.auth.updateUser({ data: {...} })` desde el cliente. Un alumno podía escribir
   `role: 'admin'` (o cualquier cosa que no fuera `'student'`) en su propio token y pasar el
   chequeo `role <> 'student'` de las policies de `students`/`class_attendance`/`payments`.
2. Migración 010 encontró el mismo patrón (`auth.role() = 'authenticated'`, sin distinguir rol en
   absoluto) todavía vigente en `posts`, `site_settings` y el bucket `media` — cualquier cuenta
   logueada, incluida la de un alumno, podía publicar/editar/borrar artículos del blog, pisar el
   contenido público del sitio, o subir/borrar archivos del bucket, llamando directo a la API
   REST de Supabase con su propio JWT.
3. El fix (migración 011 + código): todo el chequeo de rol pasa a `app_metadata`, que solo el
   `service_role` (admin client, nunca expuesto al navegador) puede escribir. Rollout: hubo que
   backfillear `app_metadata` para las cuentas ya existentes ANTES de que el código nuevo llegara
   a producción — mientras una cuenta de alumno existiera sin `role` en `app_metadata`, la nueva
   policy la trataba como ADMIN (peor que el bug original). Documentado en el header de la
   migración 011 como ventana de riesgo breve pero real.

**Implicancia para código nuevo**: cualquier chequeo de rol/permiso nuevo lee `app_metadata`.
Escribir `app_metadata` requiere el admin client (`createSupabaseAdminClient()`, `service_role`)
— nunca se puede hacer desde una sesión de usuario normal, ni siquiera para que el usuario edite
su propia cuenta (ver `changePassword` en `auth.ts`, que usa el admin client solo para limpiar
`must_change_password` aunque el usuario esté tocando su propia sesión).

## Sin API routes — todo por Server Actions + RLS (DECISION)

No hay `src/app/api/`. Toda mutación pasa por una Server Action que llama a Supabase
directamente, protegida en tres capas (middleware, `require*()`, RLS — ver `ARCHITECTURE.md`).
Por qué importa: significa que no hay una segunda superficie de auth que pueda desincronizarse
del patrón `app_metadata` — si alguna vez se agrega un endpoint HTTP propio (`route.ts`), hay que
replicar el mismo patrón de tres capas ahí, no asumir que "ya está protegido" porque el resto del
código lo está.

## `site_settings` con fallback derivado de `site-config.ts`, no hardcodeado dos veces (DECISION)

El fallback de `getSiteSettings()` se construye referenciando `siteConfig.content.*` (no
retipeando los valores a mano) para que nunca pueda divergir de lo que las páginas públicas
mostrarían si la tabla estuviera vacía. Ver `ARCHITECTURE.md` para el mecanismo de merge.

## Contraseña temporal por WhatsApp, no por email (DECISION)

El alta de cuenta de alumno no manda ningún email real — el email es un identificaor sintético
que Supabase Auth exige pero nunca recibe nada. La contraseña temporal se muestra una vez en
pantalla al admin, que se la pasa al alumno por WhatsApp. Esto es coherente con que `resend`
(declarado en `package.json`) no tenga ningún call site en `src/` — no es que el envío de mail
esté roto, es que nunca se implementó ese flujo. Ver `OPEN_QUESTIONS.md`.
