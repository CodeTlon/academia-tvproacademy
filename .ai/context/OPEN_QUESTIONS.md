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

3. **¿Se va a usar `resend` en algún momento, o se puede quitar?** Está declarado en
   `package.json` sin ningún call site. Si hay un plan de agregar notificaciones por email
   (ej. avisar a un alumno que está por vencer), documentarlo acá evita que alguien lo borre por
   "dependencia sin uso" y rompa un plan futuro.

4. **¿Cuál es el comportamiento correcto para una ausencia justificada?** (`DOMAIN.md`,
   `KNOWN_ISSUES.md` #7). El comentario de la migración 007 y el comentario en `students.ts` se
   contradicen sobre si debería descontar del ciclo de 8 clases. El código hoy SÍ la descuenta.
   Confirmar antes de tocar esa lógica.

5. **¿Se corrió `npm audit fix` para `@tiptap/*` alguna vez, o conviene hacerlo ahora?**
   (`KNOWN_ISSUES.md` #4). Fix sin breaking change disponible, pero toca `package-lock.json` —
   no se ejecutó en esta sesión de documentación por alcance, no por riesgo técnico.
