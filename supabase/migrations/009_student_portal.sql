-- TV Pro Academy — portal de alumnos: cada alumno puede loguearse y ver
-- (solo lectura) su propio estado, clases y pagos.
-- Migración 009

alter table public.students add column if not exists email text unique;
alter table public.students add column if not exists user_id uuid unique references auth.users(id) on delete set null;

-- Las políticas viejas eran `auth.role() = 'authenticated'` — cualquier cuenta
-- logueada, incluidas las de alumnos, tenía acceso total. Se reemplazan (no se
-- suman) por versiones que excluyen el rol 'student' vía user_metadata, porque
-- en RLS las políticas permisivas se OR-ean: la vieja policy amplia seguiría
-- ganando si solo se agregara una nueva más angosta.
drop policy if exists "Authenticated can manage students" on public.students;
create policy "Admin can manage students"
  on public.students for all
  using (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student');

drop policy if exists "Authenticated can manage attendance" on public.class_attendance;
create policy "Admin can manage attendance"
  on public.class_attendance for all
  using (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student');

drop policy if exists "Authenticated can manage payments" on public.payments;
create policy "Admin can manage payments"
  on public.payments for all
  using (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student')
  with check (coalesce(auth.jwt()->'user_metadata'->>'role', '') <> 'student');

drop policy if exists "Student can read own row" on public.students;
create policy "Student can read own row"
  on public.students for select
  using (user_id = auth.uid());

drop policy if exists "Student can read own attendance" on public.class_attendance;
create policy "Student can read own attendance"
  on public.class_attendance for select
  using (student_id in (select id from public.students where user_id = auth.uid()));

drop policy if exists "Student can read own payments" on public.payments;
create policy "Student can read own payments"
  on public.payments for select
  using (student_id in (select id from public.students where user_id = auth.uid()));
