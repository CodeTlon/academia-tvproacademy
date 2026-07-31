-- TV Pro Academy — Alumnos: asistencia y pagos (reemplazo del cuaderno)
-- Migración 004

create table if not exists public.students (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  phone             text,
  weekly_frequency  smallint not null default 2 check (weekly_frequency between 1 and 7),
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Una fila por clase a la que asistió el alumno. student_id + class_date es
-- único para que marcar "presente" dos veces el mismo día no duplique.
create table if not exists public.class_attendance (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  class_date   date not null,
  created_at   timestamptz not null default now(),
  unique (student_id, class_date)
);

-- Una fila por pago registrado (mensual). El ciclo vigente de clases se
-- calcula en la app a partir del pago más reciente — ver getStudentsWithStatus.
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  paid_at      date not null,
  created_at   timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.class_attendance enable row level security;
alter table public.payments enable row level security;

-- Sin policy de lectura pública: alumnos/asistencia/pagos son datos internos,
-- no hay página pública que los muestre (a diferencia de posts).
drop policy if exists "Authenticated can manage students" on public.students;
create policy "Authenticated can manage students"
  on public.students for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage attendance" on public.class_attendance;
create policy "Authenticated can manage attendance"
  on public.class_attendance for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can manage payments" on public.payments;
create policy "Authenticated can manage payments"
  on public.payments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
