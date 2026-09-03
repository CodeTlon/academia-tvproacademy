-- TV Pro Academy — fix de escalada de privilegios: las policies de 009
-- distinguían admin/alumno leyendo `role` de `user_metadata`, pero
-- `user_metadata` lo puede reescribir el propio usuario logueado desde el
-- cliente (`supabase.auth.updateUser({ data: {...} })`, sin pasar por
-- service role). Un alumno podía llamar esa API directo y ponerse
-- `role !== 'student'` para pasar el chequeo de "Admin can manage ...".
-- `app_metadata` solo la puede escribir el service role (admin API), así
-- que se usa esa en su lugar. El código (`src/actions/students.ts`,
-- `src/actions/auth.ts`) ya pasa a leer/escribir `app_metadata` en el mismo
-- cambio que esta migración acompaña.
-- Migración 011
--
-- ROLLOUT: backfillear ANTES de que el código nuevo llegue a producción (o
-- en la misma ventana de deploy). Mientras una cuenta de alumno exista sin
-- `role` en `app_metadata`, las policies de abajo la tratan como ADMIN (
-- `coalesce(..., '') <> 'student'` da true si no hay claim) — peor que el
-- bug original. Además, un access token de alumno ya emitido ANTES del
-- backfill sigue con el `app_metadata` viejo (vacío) hasta que Supabase lo
-- refresque (≤1h) o el alumno vuelva a loguearse — ventana breve pero real,
-- documentarla si se reporta un acceso indebido en esa hora posterior al
-- deploy.

-- Copia `role`/`student_id`/`must_change_password` de `user_metadata` (donde
-- vivían hasta ahora) a `app_metadata` para toda cuenta ya creada.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
  'role', raw_user_meta_data->>'role',
  'student_id', raw_user_meta_data->>'student_id',
  'must_change_password', (raw_user_meta_data->>'must_change_password')::boolean
))
where raw_user_meta_data ? 'role';

drop policy if exists "Admin can manage students" on public.students;
create policy "Admin can manage students"
  on public.students for all
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student');

drop policy if exists "Admin can manage attendance" on public.class_attendance;
create policy "Admin can manage attendance"
  on public.class_attendance for all
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student');

drop policy if exists "Admin can manage payments" on public.payments;
create policy "Admin can manage payments"
  on public.payments for all
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'student');
