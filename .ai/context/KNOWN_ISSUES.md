# KNOWN_ISSUES.md

Severidad explícita. Todo lo de acá fue verificado activamente en esta sesión (comandos
read-only contra Vercel/GitHub/npm, lectura de código) — no son suposiciones.

---

## ALTA

### 1. No hay ambiente de staging — desarrollo local pega contra la base de producción

**Evidencia**: `vercel env ls` solo tiene variables para `Production` y `Development` (no
`Preview`). Se comparó `NEXT_PUBLIC_SUPABASE_URL` entre ambos ambientes (`vercel env pull` a un
archivo temporal, sin persistir, solo para leer esa línea) — es el mismo proyecto Supabase
(`ejgdcorolzildmgqldoj.supabase.co`) en los dos casos.

**Escenario de falla concreto**: cualquier desarrollador (o agente) que corra `npm run dev`
localmente y pruebe una acción destructiva "para ver qué pasa" (borrar un alumno de prueba,
crear posts de prueba, dar de alta una cuenta de portal de prueba) está mutando datos reales de
la academia. No hay red de seguridad — no hay una base de "desarrollo" separada a la que apuntar
en su lugar.

**Fix propuesto (sin aplicar)**: crear un segundo proyecto Supabase para desarrollo, con su
propio `.env.local`, y correr las 11 migraciones ahí. Es una decisión de infraestructura que
excede el alcance de esta tarea de documentación — queda en `OPEN_QUESTIONS.md` para el usuario.

### 2. Sin CI/gate obligatorio antes de que un push a `main` llegue a producción

**Evidencia**: no hay `.github/workflows/`, ni pre-commit/pre-push hook, ni script `lint`. El
deployment `academia-tvproacademy-k2r2l9550-...` (2026-09-01T04:04, estado Error) falló el build
en producción con `Type error: Module "./auth" has no exported member 'requireAdmin'` —
exactamente el bug que describe el commit `b562af9` ("fix: add missing requireAdmin export (was
only in working tree, broke prod build)"). El primer lugar donde se detectó fue el build de
Vercel en producción, no una corrida local de `npm run type-check`.

**Impacto real**: Vercel no tumba el sitio si el build falla (el deploy bueno anterior sigue
sirviendo tráfico), así que no hubo downtime — pero el push llegó a intentar deployar a
producción sin haber pasado type-check localmente.

**Fix propuesto (sin aplicar)**: un workflow de GitHub Actions que corra `npm run type-check` en
cada PR/push, o como mínimo un hook de pre-push local. Decisión de tooling nueva, no aplicada en
esta tarea.

---

## MEDIA

### 3. Repositorio de GitHub público con código propietario

**Evidencia**: `gh api repos/CodeTlon/academia-tvproacademy` → `"visibility": "public"`.
`LICENSE`/`package.json` marcan el proyecto como `UNLICENSED` / todos los derechos reservados de
CodeTlon o el cliente. No hay secretos expuestos (verificado — ver ítem relacionado en
`OPEN_QUESTIONS.md`), así que esto no es una fuga de credenciales, pero cualquiera puede leer la
lógica de negocio completa, el esquema de datos, y la historia de la vulnerabilidad de escalada
de privilegios (migraciones 010/011 documentan el bug en detalle en sus propios comentarios SQL).

**Fix propuesto (sin aplicar)**: si no es intencional, poner el repo en privado (`gh repo edit
CodeTlon/academia-tvproacademy --visibility private`) — acción que no se ejecutó, requiere
confirmación explícita del usuario.

### 4. Vulnerabilidad `@tiptap/*` con fix disponible

**Evidencia**: `npm audit` reporta `@tiptap/core <=3.30.4` (y toda la familia de extensions que
dependen de él) con severidad "high" por CVSS pero **explotabilidad real acotada**: el vector es
`mergeAttributes()` con una key `__proto__` maliciosa y ReDoS en el parseo de Markdown — el único
punto de entrada es el editor del blog, detrás de `requireAdmin()` + middleware. Requiere que
quien pega/escribe el contenido ya sea un admin autenticado, no es explotable por un visitante.
**Fix disponible sin breaking change** vía `npm audit fix` (no se corrió — es una mutación del
`package.json`/lockfile, no de datos de producción, pero se deja para que el usuario lo apruebe
explícitamente dado que toca dependencias).

### 5. `README.md` desactualizado

Describe el proyecto como el "CodeTlon Demo Template" genérico con `src/lib/demo-config.ts` como
único archivo a tocar — ese patrón fue reemplazado por `site_settings` + Supabase (ver
`ARCHITECTURE.md`/`CURRENT_STATE.md`). No se reescribió en esta tarea (es documentación de
producto, no `.ai/context/`).

---

## BAJA

### 6. `postcss` vulnerable, transitivo vía el propio Next.js

**Evidencia**: `npm audit` reporta `postcss <=8.5.22` dentro de `node_modules/next/node_modules/
postcss` (el `postcss` interno del bundler de Next, no el de nivel superior que usa Tailwind).
Vectores: XSS en el stringify de CSS, y lectura arbitraria de archivos `.map` vía
`sourceMappingURL` no confiable. Severidad real en producción: BAJA — son vectores de
build-time/dev, no del bundle CSS servido a un visitante. El fix (`npm audit fix --force`)
instala `next@16.3.5`, un major breaking change — fuera de alcance de esta tarea, queda como
upgrade pendiente a evaluar aparte.

### 7. Inconsistencia sin confirmar: ¿una ausencia justificada descuenta del ciclo de clases?

El comentario de la migración `007_excused_absence.sql` dice que no debería descontar; el
comentario en `src/lib/students.ts` dice que sí (y el código efectivamente cuenta toda fila de
`class_attendance`, `excused` o no, por igual). No se tocó código para resolver esto — ver
`DOMAIN.md` y `OPEN_QUESTIONS.md`.

### 8. `resend` es una dependencia sin uso

Declarado en `package.json`, cero call sites en `src/` (`grep -rn "resend" src` no encuentra
nada). No es un bug, pero es peso muerto — candidato a remover si no hay plan de usarlo pronto.
