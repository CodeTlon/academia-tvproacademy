-- TV Pro Academy — ausencia justificada: clase programada que el alumno no
-- pudo tomar, no debe descontar del ciclo (a diferencia de una clase que sí
-- se dio, la haya tomado o no el alumno)
-- Migración 007

alter table public.class_attendance add column if not exists excused boolean not null default false;
