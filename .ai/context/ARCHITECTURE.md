# ARCHITECTURE.md

Cada afirmación está etiquetada FACT (verificado contra código/API real), ASSUMPTION (razonable
pero no confirmado), UNKNOWN (no se pudo determinar), o DECISION (elección deliberada, con su
porqué en `DECISIONS.md`).

## Stack (FACT — `package.json`)

- Next.js 15.5, App Router, React 18, TypeScript 5.4.
- Supabase: `@supabase/ssr` (cliente server-side con cookies) + `@supabase/supabase-js` (admin
  client con `service_role`). Postgres + Auth + Storage, todo en un solo proyecto Supabase.
- Tailwind CSS 3.4. Tiptap 3 (editor de contenido del blog: `@tiptap/react`, `starter-kit`,
  extensions `image`/`link`/`youtube`/`placeholder`).
- `isomorphic-dompurify` (sanitización HTML), `sharp` (reprocesamiento de imágenes), `zod`,
  `slugify`, `motion` (animaciones), `lucide-react` (iconos), `resend` (declarado, **sin uso
  activo** — ver más abajo).
- Node.js 24.x en Vercel (FACT — `vercel project inspect`).

## Capas — sin API routes (FACT)

`src/app/api/` no existe. Toda la lógica de servidor pasa por:

```
UI (Server/Client Component)
   → Server Action ('use server', en src/actions/*.ts)
       → require{User,Admin,Student}() — chequeo de sesión/rol (defensa en profundidad #1)
       → cliente Supabase (createSupabaseServerClient / createSupabaseAdminClient)
           → RLS de Postgres (defensa en profundidad #2, misma fuente de rol: app_metadata)
```

No hay una segunda superficie de auth (API REST propia) que pueda desincronizarse de este
patrón — todo el estado mutable pasa por el mismo camino. Esto es deliberado, ver `DECISIONS.md`.

## Auth y roles (FACT — leído línea por línea en `src/middleware.ts` y las 4 archivos de
`src/actions/*.ts` que hacen escrituras)

- Login único (`/login`) para admin y alumno — el rol se resuelve después de autenticar, leyendo
  `user.app_metadata.role` (`'student'` o ausente = admin).
- `src/middleware.ts` (matcher: `/dashboard/:path*`, `/portal/:path*`, `/login`):
  - Sin sesión en ruta protegida → redirect a `/login`.
  - Alumno pidiendo `/dashboard` → redirect a `/portal` (y viceversa).
  - `app_metadata.must_change_password === true` → fuerza a `/dashboard/cambiar-password` o
    `/portal/cambiar-password` antes de dejar pasar a cualquier otra ruta.
- `src/actions/auth.ts` expone `requireUser()`, `requireStudent()`, `requireAdmin()` — lanzan si
  no corresponde. **Cada Server Action de escritura en `students.ts`, `posts.ts`, `media.ts`,
  `settings.ts` llama `requireAdmin()` como primera línea dentro del `try`** (verificado: no hay
  ninguna excepción). Las lecturas de Server Components (ej. `getStudentsWithStatus()` en
  `src/lib/students.ts`) no llaman `requireAdmin()` explícito porque ya están detrás del
  middleware Y de RLS — pero cualquier Server Action nueva que mute datos DEBE llamarlo.
- El rol vive en **`app_metadata`**, nunca en `user_metadata` — ver `DECISIONS.md` para la
  historia de por qué (fue una vulnerabilidad real, ya parchada).

## Esquema de datos — estado final tras 11 migraciones (FACT — leí las 11, en orden)

| Tabla | Columnas clave | RLS (estado final) |
|---|---|---|
| `site_settings` | `key` (PK, text), `value` (jsonb), `updated_at` | SELECT público (`using (true)`). INSERT/UPDATE/DELETE solo si `app_metadata.role <> 'student'`. |
| `posts` | `id`, `title`, `slug` (unique), `excerpt`, `content` (HTML sanitizado), `cover_image`, `category`, `published`, `created_at`, `updated_at` | SELECT público solo si `published = true`. Todo lo demás (incluyendo leer drafts) solo admin. |
| `students` | `id`, `name`, `phone`, `weekly_frequency` (1-7), `price_per_class`, `active`, `status_override` (`'al_dia'\|'vencido'\|null`), `email` (unique, sintético), `user_id` (unique, FK a `auth.users`), `created_at` | SELECT propio: `user_id = auth.uid()`. Todo (incl. SELECT de cualquier fila) si `app_metadata.role <> 'student'`. |
| `class_attendance` | `id`, `student_id` (FK cascade), `class_date`, `class_time`, `excused` (bool), unique `(student_id, class_date)` | SELECT propio vía subquery a `students`. Todo si admin. |
| `payments` | `id`, `student_id` (FK cascade), `paid_at`, `amount`, `classes_qty` | Igual patrón que `class_attendance`. |
| `storage.objects` (bucket `media`, público) | — | SELECT público. INSERT/UPDATE/DELETE solo admin (`app_metadata.role <> 'student'`). |

Notas:
- Ninguna tabla tiene política de UPDATE/DELETE para el propio alumno — el portal es
  estrictamente de solo lectura para esa cuenta, tal como está documentado en el código.
- El bucket `media` es público a propósito: sirve portadas de blog e imágenes de contenido que
  se muestran en el sitio público.
- No hay tabla que espeje email/rol de `auth.users` — `emailExists()` en `auth.ts` pagina el
  Admin API de Supabase (`listUsers`) porque son pocos usuarios (los del panel), no una tabla
  propia.

## `site_settings` — contenido público editable (FACT — `src/lib/site-settings.ts` +
`src/lib/site-config.ts`)

- `src/lib/site-config.ts` es el **fallback estático en código**: business info, tokens de marca
  (colores, font), y el contenido "de fábrica" de cada sección (hero, about, services,
  facilities, process, schedule).
- `getSiteSettings()` (cacheada por request con `React.cache`) trae todas las filas de
  `site_settings`, y hace **merge** (no replace) sobre ese fallback: objetos se mergean campo a
  campo (para que un campo nuevo agregado en código no se pierda si la fila guardada es vieja),
  arrays se reemplazan enteros.
- El patrón `src/lib/demo-config.ts` que describe el `README.md` **ya no existe** — fue
  reemplazado por este esquema DB-backed. El README quedó desactualizado (ver `KNOWN_ISSUES.md`).

## Pipeline de imágenes (FACT — `src/actions/media.ts`, `src/lib/upload-limits.ts`,
`src/lib/client-image-resize.ts`)

1. Cliente: `resizeImageFile` achica la imagen en el navegador antes de subir (evita el límite de
   body de Vercel).
2. Server Action `uploadImageAction` (admin-only): valida tamaño (`MAX_IMAGE_BYTES`, 12 MB),
   re-procesa con `sharp` (rotate + resize a máx 2000x2000 + reencode a WebP calidad 82) para un
   peso final consistente sin importar el formato/tamaño original, sube a Supabase Storage
   bucket `media` como `Blob` (no `Buffer` directo — `@supabase/storage-js`/undici rechaza
   buffers pooled de Node con "SharedArrayBuffer is not allowed", ver comentario en el código).
3. `next.config.js` tiene `images.remotePatterns: [{ protocol: 'https', hostname: '**' }]` —
   **cualquier dominio HTTPS**, no una whitelist. Deliberado: el admin puede pegar la URL de
   cualquier imagen (portada de blog, drill de metodología) sin que `next/image` la rechace.
   Superficie de riesgo limitada porque solo un admin autenticado puede pegar URLs (no es un
   input público).

## Seguridad HTTP (FACT — `next.config.js`, completo y bien comentado)

CSP (con `unsafe-inline` en `script-src` justificado por el script inline de Google Analytics —
nota explícita en el código de que pasar a nonces sería más estricto pero está fuera de alcance
de un fix de bajo riesgo), HSTS (`max-age=63072000; includeSubDomains; preload`),
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
`Permissions-Policy` restrictiva. Nada pendiente acá — solo documentar que existe.

## Cadena de deploy (FACT, verificado activamente contra Vercel/GitHub — no asumido de ningún
README)

- **Vercel tiene integración Git real con `main`** — auto-deploy en cada push, no manual.
  Evidencia: existe el alias `academia-tvproacademy-git-main-mateo-pavonis-projects.vercel.app`
  (Vercel solo genera alias `-git-<branch>-` cuando hay un repo conectado vía la app de
  GitHub/GitLab/Bitbucket) y el deploy de producción más reciente (`dpl_CJH4b...`, creado
  2026-09-03T16:06:19) quedó ~7 minutos después del commit `a4cfe30` (2026-09-03T15:59:10) —
  timing consistente con un build disparado automáticamente por el push, no con un
  `vercel deploy` manual en otro momento.
- Proyecto Vercel: `academia-tvproacademy` (org `mateo-pavonis-projects`, root directory `.`).
- Repo: `github.com/CodeTlon/academia-tvproacademy`, rama default `main`, **visibilidad
  pública** (ver `KNOWN_ISSUES.md`).
- **Un solo ambiente de datos real.** `vercel env ls` solo tiene variables para `Production` y
  `Development` (no `Preview`). Se comparó (`vercel env pull`, sin persistir el archivo) el
  valor de `NEXT_PUBLIC_SUPABASE_URL` entre ambos: **es el mismo proyecto Supabase**
  (`ejgdcorolzildmgqldoj.supabase.co`). No hay staging. Correr `npm run dev` local con
  `.env.local` pega contra la base de producción. Ver `KNOWN_ISSUES.md` (severidad ALTA).
- Como no hay variables configuradas para `Preview`, un deploy Preview de Vercel (ej. al abrir
  una PR) arrancaría con los fallbacks `?? 'placeholder'` de `middleware.ts`/
  `supabase-server.ts` — no puede autenticar contra Supabase real. (ASSUMPTION: no se probó
  abriendo una PR real, se infiere de la ausencia de env vars + el fallback en código.)
- Hubo al menos un build roto que llegó a auto-deploy en producción: el deployment con estado
  Error del 2026-09-01 04:04 falla exactamente con el error de tipos que describe el commit
  `b562af9` (`requireAdmin` no exportado — estaba solo en el working tree, no en el commit
  anterior). Vercel no tumbó el sitio (el deploy bueno anterior sigue sirviendo tráfico mientras
  el build nuevo falla), pero confirma que no hay ningún gate (CI, pre-push hook) antes de que un
  push a `main` intente desplegar a producción — el primer lugar donde se detectó el error de
  tipos fue el build de Vercel en producción, no una corrida local de `type-check`.
