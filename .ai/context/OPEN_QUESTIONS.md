# OPEN_QUESTIONS.md

Preguntas que solo el usuario puede responder: no asumir una respuesta y seguir.

1. **¿El repo público en GitHub es intencional?** (`KNOWN_ISSUES.md` #4). Pasarlo a privado es un click (`gh repo edit ... --visibility private`) pero cambia la visibilidad de un recurso compartido: requiere confirmación.
2. **¿Cuándo se hace el corte y quién crea los recursos de Coolify?** (`PENDIENTES.md`). El ambiente de staging que antes no existía ahora es `test` (Coolify), y el desarrollo local ya no toca producción.
3. **¿Se usa `resend` alguna vez (avisos de vencimiento)?** Declarado sin call site; si no hay plan, se puede quitar.
4. **¿Una ausencia justificada descuenta del ciclo de 8 clases?** El código hoy sí; un comentario viejo dice lo contrario. Confirmar antes de tocar la lógica (`DOMAIN.md`).
5. **¿`supabase/migrations/` se borra tras el corte?** Hoy se conserva como referencia de la paridad.
