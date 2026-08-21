-- =============================================================
-- 0010_alert_settings.sql
-- Threshold notifikasi (§35) disimpan sebagai DATA, bukan hardcode,
-- agar admin bisa mengubahnya lewat menu tanpa deploy ulang aplikasi.
-- =============================================================

create table public.alert_settings (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,  -- 'TAX_DUE_REMINDER_DAYS', 'BUDGET_WARNING_PCT', dst.
  value_numeric  numeric not null,
  description    text,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references public.profiles(id)
);

create trigger trg_alert_settings_updated_at
  before update on public.alert_settings
  for each row execute function public.set_updated_at();

alter table public.alert_settings enable row level security;

create policy alert_settings_select_all on public.alert_settings
  for select to authenticated using (true);

create policy alert_settings_admin_write on public.alert_settings
  for all to authenticated
  using (public.has_role(array['SUPER_ADMIN','ADMIN']))
  with check (public.has_role(array['SUPER_ADMIN','ADMIN']));

comment on table public.alert_settings is
  'Threshold notifikasi (§35), CONFIGURABLE lewat menu admin — bukan nilai hardcode di kode aplikasi.';
