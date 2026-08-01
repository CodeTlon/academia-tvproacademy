-- TV Pro Academy — hora opcional de la clase (además de la fecha)
-- Migración 006

alter table public.class_attendance add column if not exists class_time time;
