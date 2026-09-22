# OPEN_QUESTIONS.md

Preguntas que solo el usuario puede responder — no asumir una respuesta y seguir adelante.

1. **¿El repo público en GitHub es intencional?** (`KNOWN_ISSUES.md` #3). El código no tiene
   secretos, pero expone la lógica de negocio completa y la historia documentada de una
   vulnerabilidad de escalada de privilegios ya parchada. Si no fue una decisión consciente, es
   una acción de un click (`gh repo edit ... --visibility private`) que no se ejecutó en esta
   sesión porque cambia visibilidad de un recurso compartido — requiere confirmación explícita.

2. **¿Vale la pena un ambiente de staging separado?** Hoy desarrollo local y producción
   comparten la misma base de Supabase (`KNOWN_ISSUES.md` #1). La alternativa (segundo proyecto
   Supabase + correr las 11 migraciones ahí) tiene costo de mantenimiento (mantener dos esquemas
   sincronizados) — dado que es un proyecto chico con cambios de schema poco frecuentes, puede
   que no valga la pena, pero es una decisión de producto/riesgo que le corresponde al usuario,
   no algo para asumir en una auditoría de contexto.

   **Estado (2026-09-21): decidido posponer, no se va a crear ahora.** Plan ya resuelto para
   cuando se retome — no requiere volver a pensarlo, solo ejecutarlo:

   1. Dashboard de Supabase → la organización actual → "New project". Nombre sugerido:
      `tvproacademy-dev` (o `-staging`). No hace falta el mismo plan/región que producción — free
      tier alcanza para desarrollo.
   2. Guardar `Project URL`, `anon key` y `service_role key` del proyecto nuevo (Settings → API).
   3. Correr las 11 migraciones de `supabase/migrations/001_site_settings.sql` a
      `011_role_app_metadata.sql`, en orden, contra el proyecto nuevo (`supabase db push` o
      pegándolas a mano en el SQL Editor). Esto clona el esquema (tablas, RLS, funciones) sin
      ningún dato real de alumnos/pagos — las migraciones no insertan filas, solo definen schema.
   4. Crear un usuario admin de prueba en el proyecto nuevo (Auth → Add user) y setearle
      `app_metadata.role` a mano si hace falta para probar el dashboard sin pasar por el flujo de
      alta de alumno.
   5. Con las 3 keys del proyecto nuevo, armar un `.env.local` separado apuntando ahí. No tocar
      `Production` en Vercel — esto es solo para entorno local, `.env.local` sigue siendo
      gitignored y nunca se sube.

   Quien retome esto necesita acceso a la organización/billing de Supabase para el paso 1 (no es
   algo que un agente pueda hacer sin esas credenciales).

3. **¿Se va a usar `resend` en algún momento, o se puede quitar?** Está declarado en
   `package.json` sin ningún call site. Si hay un plan de agregar notificaciones por email
   (ej. avisar a un alumno que está por vencer), documentarlo acá evita que alguien lo borre por
   "dependencia sin uso" y rompa un plan futuro.

4. **¿Cuál es el comportamiento correcto para una ausencia justificada?** (`DOMAIN.md`,
   `KNOWN_ISSUES.md` #7). El comentario de la migración 007 y el comentario en `students.ts` se
   contradicen sobre si debería descontar del ciclo de 8 clases. El código hoy SÍ la descuenta.
   Confirmar antes de tocar esa lógica.

5. ~~¿Se corrió `npm audit fix` para `@tiptap/*` alguna vez, o conviene hacerlo ahora?~~
   **Resuelta 2026-09-21**: sí, aplicado (commit `c655da2`). Ver `KNOWN_ISSUES.md` #4.
