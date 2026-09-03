-- TV Pro Academy — cierra el mismo agujero de RLS que ya se había corregido
-- en 009 para students/attendance/payments, pero sobre posts, site_settings
-- y el bucket de Storage `media`: esas tres seguían con `auth.role() =
-- 'authenticated'`, que en Supabase es true para CUALQUIER cuenta logueada,
-- incluidas las de alumnos del portal. Un alumno podía publicar/editar/borrar
-- artículos del blog, pisar el contenido público del sitio (hero, nosotros,
-- contacto, etc.) o subir/borrar archivos del bucket público, llamando
-- directo a la API REST de Supabase con su propio JWT.
-- Migración 010
--
-- Mismo patrón que 009: se reemplazan (no se suman) las policies viejas —
-- en RLS las políticas permisivas se OR-ean, así que agregar una más angosta
-- sin borrar la vieja no cambia nada.

-- ─── posts (blog) ────────────────────────────────────────────────────────
-- "Public can read published posts" (select, published = true) no se toca:
-- sigue siendo la que da lectura pública al blog.
drop policy if exists "Authenticated can manage posts" on public.posts;
create policy "Admin can manage posts"
  on public.posts for all
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student');

-- ─── site_settings ───────────────────────────────────────────────────────
-- "Public can read site_settings" (select, using true) no se toca: el
-- contenido del sitio es público por diseño, solo se restringe la escritura.
drop policy if exists "Authenticated can write site_settings" on public.site_settings;
create policy "Admin can write site_settings"
  on public.site_settings for all
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student');

-- ─── storage.objects (bucket `media`) ────────────────────────────────────
-- "Public can read media" (select) no se toca: el bucket es público a
-- propósito (portadas de blog, imágenes de contenido). Solo se restringe
-- quién puede subir/editar/borrar archivos.
drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Admin can upload media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student'
  );

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Admin can update media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student'
  );

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Admin can delete media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student'
  );
