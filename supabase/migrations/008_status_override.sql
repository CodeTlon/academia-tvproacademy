-- TV Pro Academy — permite forzar manualmente el estado "al día"/"vencido"
-- de un alumno, para casos donde se lo dejó al día pero el cálculo automático
-- (ciclo de clases + vencimiento de cuota) todavía no lo refleja.
-- Migración 008

alter table public.students add column if not exists status_override text
  check (status_override in ('al_dia', 'vencido'));
