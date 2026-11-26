# Índice — .ai/context/

Generado 2026-09-18 mediante auditoría de context engineering (código + git + APIs de Vercel/
GitHub, verificado activamente, no copiado de documentación previa — no había ninguna). Si algo
acá contradice lo que ves en el código, **el código gana**; actualizá este archivo, no al revés.

| Archivo | Para qué leerlo |
|---|---|
| [PROJECT.md](PROJECT.md) | Qué es el proyecto, para quién, qué problema resuelve. Punto de partida si es tu primera vez en el repo. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, capas, patrón de auth, esquema de datos + RLS end-state, cadena de deploy real (verificada contra Vercel/GitHub, no asumida). |
| [DOMAIN.md](DOMAIN.md) | Reglas de negocio del panel de alumnos: cálculo de ciclo de clases, vencimiento de cuota, alta de cuenta de portal. |
| [CONVENTIONS.md](CONVENTIONS.md) | Patrones de código reales (Server Actions, formularios, sanitización, estructura de componentes). Sin inventar convenciones que no existen — dice explícito qué NO hay (tests, lint). |
| [DECISIONS.md](DECISIONS.md) | Por qué las cosas están hechas como están — especialmente la historia de seguridad `app_metadata` vs `user_metadata`. |
| [CURRENT_STATE.md](CURRENT_STATE.md) | Snapshot de qué está deployado hoy y desde cuándo. Puede quedar desactualizado — confirmá con `git log`/`vercel ls` si pasó tiempo. |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Problemas reales con severidad explícita (ALTA/MEDIA/BAJA), evidencia y fix propuesto sin aplicar. Leer antes de tocar auth, deploy o dependencias. |
| [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) | Preguntas que solo el usuario puede responder — no asumir una respuesta y seguir. |

## Qué leer según la tarea

| Tarea | Leé primero |
|---|---|
| Agregar/modificar una Server Action | ARCHITECTURE.md (patrón de auth) + CONVENTIONS.md |
| Tocar `src/middleware.ts`, roles, o RLS | ARCHITECTURE.md + DECISIONS.md (historia `app_metadata`) + KNOWN_ISSUES.md |
| Tocar asistencia/pagos/vencimientos de alumnos | DOMAIN.md |
| Tocar contenido público (hero, nosotros, blog, servicios) | ARCHITECTURE.md → sección `site_settings` |
| Cambiar dependencias o correr `npm audit fix` | KNOWN_ISSUES.md (severidad de cada vulnerabilidad ya clasificada) |
| Deploy, variables de entorno, ambientes | ARCHITECTURE.md → "Cadena de deploy" — **leer antes de asumir que hay staging** |
| Cualquier tarea que implique correr algo localmente | AGENTS.md (warning de producción) antes que nada |

## Fase de RAG / subagente (gate de decisión, resuelto)

- **RAG: no aplica.** Todo el corpus (11 migraciones cortas + ~15 archivos de `src/actions`/
  `src/lib`) entra cómodo en el contexto de un agente. No hay corpus externo que crezca
  independiente del código.
- **Subagente de mantenimiento: no aplica.** Proyecto único, alcance acotado, mantenimiento
  manual de este `.ai/context/` alcanza.
