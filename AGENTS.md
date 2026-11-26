# AGENTS.md — academia-tvproacademy

> ⚠️ **Proyecto en producción real** (tvproacademy.com.ar). Este repo NO es un demo, aunque
> nació de un template genérico. Hay una academia real, alumnos reales, pagos reales.
>
> **`.env.local` local apunta a la MISMA base de Supabase que producción — no existe un
> ambiente de staging separado.** Correr `npm run dev` local lee/escribe contra datos reales.
> No corras nada que mute datos (insert/update/delete, alta de usuarios, envío de mails, borrar
> archivos de Storage) sin confirmación explícita del usuario. Leer para diagnosticar está bien.
> Antes de asumir cómo se despliega o qué ambientes existen, verificalo (`vercel inspect`,
> `vercel env ls`) — no confíes en lo que diga este archivo o el `README.md` sin chequear,
> las cosas cambian.

## Qué es esto

Sitio + panel de administración + portal de alumnos para TV Pro Academy (academia de fútbol,
Córdoba, Argentina). Reemplaza un cuaderno físico de asistencia y pagos. Detalle completo en
[`.ai/context/PROJECT.md`](.ai/context/PROJECT.md).

## Stack

- **Next.js 15.5** (App Router), React 18, TypeScript.
- **Supabase**: Postgres + Auth + Storage. Sin backend propio — toda la lógica de servidor vive
  en Server Actions (`src/actions/*.ts`) que llaman directo a Supabase. **No hay API routes**
  (`src/app/api/` no existe).
- Tailwind CSS. Tiptap (editor de contenido del blog). `isomorphic-dompurify` (sanitizar HTML
  del blog). `sharp` (reprocesar imágenes subidas). Zod. Resend está en `package.json` pero no
  tiene ningún call site en `src/` — dependencia sin uso activo hoy.
- Deploy: Vercel, auto-deploy en push a `main` (integración Git, no manual). Ver
  [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) para la cadena completa verificada.

## Comandos

```bash
npm install
npm run dev          # localhost:3000 — pega contra Supabase de producción, ver warning arriba
npm run build         # el mismo build que corre Vercel al hacer push a main
npm run type-check    # tsc --noEmit — correrlo SIEMPRE antes de push, no hay CI que lo haga por vos
```

No hay `lint` script, ni ESLint configurado, ni ningún test (`jest`/`vitest`/`playwright`). El
único gate antes de que algo llegue a producción es `type-check` corrido a mano y el build de
Vercel — que ya falló en producción una vez por esto (ver `KNOWN_ISSUES.md`).

## Convenciones críticas

1. **Todo server-side pasa por Server Actions + RLS, nunca por un endpoint HTTP propio.** Si
   necesitás lógica de servidor nueva, va en `src/actions/<algo>.ts` con `'use server'` al tope,
   no en `src/app/api/`.
2. **Toda Server Action que escribe datos empieza con `requireAdmin()` / `requireUser()` /
   `requireStudent()`** (de `src/actions/auth.ts`), incluso si la ruta ya está protegida por
   `src/middleware.ts` y aunque la tabla ya tenga RLS. Las tres capas leen el mismo claim y son
   deliberadas (defensa en profundidad) — no las trates como redundantes para "simplificar".
3. **El rol de un usuario vive en `user.app_metadata.role`, NUNCA en `user_metadata`.**
   `user_metadata` lo puede reescribir el propio usuario logueado desde el cliente — usarlo para
   un chequeo de rol es la vulnerabilidad de escalada de privilegios que ya se parchó (migraciones
   010/011, ver `DECISIONS.md`). Solo el `service_role` (admin client) puede escribir
   `app_metadata`.
4. Todo HTML que venga del editor Tiptap se sanitiza con `sanitizePostContent`
   (`src/lib/sanitize-html.ts`) **en dos puntos**: al guardar (server action) y al servir
   (`dangerouslySetInnerHTML` en la página pública del blog). Si agregás un campo nuevo con HTML
   libre, replicá ese patrón — no confíes en un solo punto de sanitización.
5. Errores de Supabase/Postgres nunca se muestran crudos al usuario — pasan por
   `friendlyError()` (`src/lib/friendly-error.ts`) primero.
6. Formularios del dashboard: `useActionState` + una server action bindeada con `.bind(null, id)`
   cuando hace falta un id fijo (ver `StudentForm.tsx` como referencia). `revalidatePath()`
   después de cada mutación exitosa.
7. `site_settings` es la fuente de verdad del contenido público editable; su fallback en código
   (`src/lib/site-config.ts`) se deriva 1:1 — si agregás una key nueva a `site-config.ts`,
   agregala también al `FALLBACK` de `src/lib/site-settings.ts` para que no diverjan.

## Para más contexto

| Necesitás... | Leé |
|---|---|
| Entender qué hace el proyecto y para quién | [`.ai/context/PROJECT.md`](.ai/context/PROJECT.md) |
| Tocar auth, roles, RLS, o cualquier Server Action | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) + [`.ai/context/KNOWN_ISSUES.md`](.ai/context/KNOWN_ISSUES.md) |
| Tocar el panel de alumnos (asistencia, pagos, vencimientos) | [`.ai/context/DOMAIN.md`](.ai/context/DOMAIN.md) |
| Tocar contenido público (hero, nosotros, servicios, blog) | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) — sección `site_settings` |
| Deploy, ambientes, infraestructura | [`.ai/context/ARCHITECTURE.md`](.ai/context/ARCHITECTURE.md) — sección "Cadena de deploy" |
| Por qué algo está hecho como está hecho | [`.ai/context/DECISIONS.md`](.ai/context/DECISIONS.md) |
| Qué falta, qué es riesgoso, por qué | [`.ai/context/KNOWN_ISSUES.md`](.ai/context/KNOWN_ISSUES.md) |
| Convenciones de código (naming, estructura, patrones) | [`.ai/context/CONVENTIONS.md`](.ai/context/CONVENTIONS.md) |
| Preguntas sin resolver que necesitan al usuario | [`.ai/context/OPEN_QUESTIONS.md`](.ai/context/OPEN_QUESTIONS.md) |

Ver también [`.ai/context/00_INDEX.md`](.ai/context/00_INDEX.md) para el índice completo.
