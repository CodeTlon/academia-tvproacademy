-- TV Pro Academy — precio por clase del alumno + monto/cantidad por pago
-- Migración 005

alter table public.students add column if not exists price_per_class numeric(10,2);

alter table public.payments add column if not exists amount numeric(10,2);
alter table public.payments add column if not exists classes_qty smallint;
