# CONVENTIONS.md

Derivado de código real (`src/actions/*.ts`, `src/app/dashboard/**`, `src/components/**`). Donde
no hay convención real, se dice explícito — no se inventa una.

## Server Actions (`src/actions/*.ts`)

- `'use server'` al tope del archivo (no por función).
- Toda acción de escritura empieza con `await requireAdmin()` (o `requireUser`/`requireStudent`
  según corresponda) dentro de un `try`. Ver `ARCHITECTURE.md`.
- Errores de Supabase se pasan siempre por `friendlyError(error, 'mensaje default en castellano')`
  (`src/lib/friendly-error.ts`) antes de devolverlos al estado del form — nunca `error.message`
  crudo a la UI.
- `revalidatePath(...)` después de cada mutación exitosa, sobre las rutas que muestran ese dato.
- `redirect(...)` va **fuera** del `try/catch` (es una excepción de control de flujo de Next, no
  un error real de la acción).
- Naming: `create<Cosa>Action`, `update<Cosa>Action`, `delete<Cosa>Action`, o un verbo directo
  para acciones que no son CRUD puro (`markAttendanceAction`, `addPaymentAction`).
- Tipo de estado del form: `export type <Cosa>State = { error?: string; ...campos } | undefined`.

## Formularios del dashboard (Client Components)

Patrón (ver `StudentForm.tsx`, `PostForm.tsx` como referencia):

```tsx
'use client'
import { useActionState } from 'react'

const action = isEdit ? updateXAction.bind(null, x.id) : createXAction
const [state, formAction] = useActionState<XState, FormData>(action, undefined)

<form action={formAction}>
  {state?.error && <ErrorBanner>{state.error}</ErrorBanner>}
  ...
</form>
```

`.bind(null, id)` para fijar un id cuando la acción lo necesita (React codifica el argumento
bindeado en el FormData como campos `$ACTION_*` — si tu action arma el `value` iterando
`formData.entries()` genéricamente, como `updateSiteSettings`, filtrá esos campos explícito).

## Sanitización de HTML (blog)

`sanitizePostContent()` (`src/lib/sanitize-html.ts`, whitelist de tags/atributos armada a mano
según lo que el editor Tiptap puede generar) se llama **dos veces**: al guardar en la Server
Action (`posts.ts`) y de nuevo al renderizar con `dangerouslySetInnerHTML`
(`blog/[slug]/page.tsx`). Si agregás un campo con HTML libre nuevo, replicá el patrón de doble
sanitización — no asumas que sanitizar una vez alcanza.

## Estructura de `src/components/`

- `dashboard/` — piezas reusables del panel admin (`Field.tsx`, `SaveButton.tsx`,
  `ConfirmDialog.tsx`, `PasswordInput.tsx`, etc.) — no específicas de una entidad.
- `sections/` — secciones del sitio público (`Hero`, `About`, `Services`, `FAQ`, `Contact`).
- `layout/` — `Navbar`/`Footer`/`NavbarClient` (el navbar distingue "Mi dashboard"/"Mi portal"
  según el rol de la sesión).
- `analytics/` — Google Analytics + banner de cookie consent.
- `seo/` — JSON-LD structured data.
- `ui/` — genéricos sin dominio (`BackToTop`, `ShareButton`, `skeleton`).
- `icons/` — iconos custom que no vienen de `lucide-react`.

Export por defecto (`export default function ComponentName`) es el patrón dominante en
componentes de página/sección.

## Otros lib helpers (`src/lib/`)

| Archivo | Qué hace |
|---|---|
| `friendly-error.ts` | Traduce errores de Postgres/Supabase (por código PG o por patrón de mensaje) a castellano apto para UI. |
| `sanitize-html.ts` | Sanitiza HTML del editor del blog (whitelist + hook que bloquea iframes que no sean de YouTube). |
| `date.ts` | `todayStr()` y helpers de fecha en formato `YYYY-MM-DD`. |
| `utils.ts` | Utilidades genéricas (`cn()` para clases Tailwind vía `clsx`/`tailwind-merge`, etc.). |
| `storage.ts` | `extractStoragePath()` — deriva el path interno del bucket a partir de una URL pública, para poder borrar el archivo. |
| `upload-limits.ts` | Constantes de límite de tamaño de imagen (`MAX_IMAGE_BYTES`). |
| `client-upload.ts` / `client-image-resize.ts` | Resize de imagen en el navegador antes de subir (evita el límite de body de Vercel). |
| `image-focal.ts` | Punto focal de imagen (para el `FocalPicker` del dashboard). |

## Lo que NO hay (decilo así si te preguntan, no lo inventes)

- **Sin tests**: no hay `jest`/`vitest`/`playwright` en `devDependencies`, ni `*.test.*`/
  `*.spec.*`/`__tests__/`/`e2e/` en ningún lado del repo.
- **Sin lint configurado**: no hay `.eslintrc*` ni `eslint.config.*`, ni script `lint` en
  `package.json`.
- **Sin CI**: no hay `.github/workflows/`. El único gate antes de producción es correr
  `npm run type-check` a mano (ver `KNOWN_ISSUES.md` — ya falló una vez por no correrlo).

Si el usuario pide agregar tests o lint, no hay un patrón existente que replicar — es una
decisión nueva de tooling, preguntá antes de elegir el framework.
