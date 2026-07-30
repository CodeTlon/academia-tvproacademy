-- TV Pro Academy — site_settings
-- Migración 001: tabla de configuración editable del sitio (key/value JSON).
-- Sin seed: el fallback vive en código (src/lib/site-settings.ts, derivado de
-- demo-config.ts) para que nunca diverja de lo que leen las páginas públicas.

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Authenticated can write site_settings" on public.site_settings;
create policy "Authenticated can write site_settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
