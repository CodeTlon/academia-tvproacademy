-- TV Pro Academy — bucket de Storage para imágenes/videos subidos desde el
-- dashboard (portada de blog, imágenes de contenido, drills de metodología).
-- Migración 003

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Authenticated can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Authenticated can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Authenticated can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
