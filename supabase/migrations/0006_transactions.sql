-- =============================================================
-- 0006_transactions.sql
-- Transaksi pemeliharaan (dengan workflow status), rincian, riwayat
-- status, dan transaksi BBM.
-- =============================================================

-- -------------------------------------------------------------
-- MAINTENANCE_TRANSACTIONS (header) — §8, §23
-- -------------------------------------------------------------
create table public.maintenance_transactions (
  id                    uuid primary key default gen_random_uuid(),
  transaction_number    text not null unique,        -- diisi otomatis oleh trigger (0008)
  transaction_date      date not null,
  document_number       text,                          -- nomor dokumen sumber (SPK/nota, dsb.)
  asset_id              uuid not null references public.assets(id) on delete restrict,
  maintenance_type_id   uuid not null references public.maintenance_types(id) on delete restrict,
  description           text not null,                 -- uraian pekerjaan
  vendor_id             uuid references public.vendors(id) on delete restrict,
  invoice_number        text,
  proof_number           text,                          -- nomor bukti
  amount                numeric(18,2) not null check (amount >= 0),
  funding_source_id     uuid references public.funding_sources(id) on delete restrict,
  program_id            uuid references public.programs(id) on delete restrict,
  activity_id           uuid references public.activities(id) on delete restrict,
  subactivity_id        uuid references public.subactivities(id) on delete restrict,
  budget_account_id     uuid not null references public.budget_accounts(id) on delete restrict,
  fiscal_year_id        uuid not null references public.fiscal_years(id) on delete restrict,
  unit_id               uuid not null references public.units(id) on delete restrict,
  status                text not null default 'DRAFT'
                          check (status in
                            ('DRAFT','SUBMITTED','VERIFIED','APPROVED','POSTED','REJECTED','CANCELLED')),
  rejection_reason      text,
  notes                 text,
  created_by            uuid references public.profiles(id),
  updated_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz,
  deleted_by            uuid references public.profiles(id),
  -- §33: cegah data invalid di level database, bukan hanya UI
  constraint chk_rejection_reason check (
    (status <> 'REJECTED') or (rejection_reason is not null)
  )
);

create trigger trg_maintenance_transactions_updated_at
  before update on public.maintenance_transactions
  for each row execute function public.set_updated_at();

create index idx_mt_asset on public.maintenance_transactions(asset_id);
create index idx_mt_unit on public.maintenance_transactions(unit_id);
create index idx_mt_fiscal_year on public.maintenance_transactions(fiscal_year_id);
create index idx_mt_status on public.maintenance_transactions(status);
create index idx_mt_date on public.maintenance_transactions(transaction_date);
create index idx_mt_budget_account on public.maintenance_transactions(budget_account_id);
create index idx_mt_proof_trgm on public.maintenance_transactions using gin (proof_number gin_trgm_ops);

comment on constraint chk_rejection_reason on public.maintenance_transactions is
  'Transaksi REJECTED wajib memiliki alasan penolakan (§23).';

-- -------------------------------------------------------------
-- MAINTENANCE_DETAILS (rincian item per transaksi, opsional)
-- -------------------------------------------------------------
create table public.maintenance_details (
  id               uuid primary key default gen_random_uuid(),
  transaction_id   uuid not null references public.maintenance_transactions(id) on delete cascade,
  item_name        text not null,
  quantity         numeric(12,2) not null default 1 check (quantity > 0),
  unit_price       numeric(18,2) not null check (unit_price >= 0),
  subtotal         numeric(18,2) generated always as (quantity * unit_price) stored,
  notes            text
);
create index idx_maintenance_details_transaction on public.maintenance_details(transaction_id);

-- -------------------------------------------------------------
-- STATUS_HISTORY (riwayat perubahan status workflow) — §23, diisi trigger di 0008
-- -------------------------------------------------------------
create table public.status_history (
  id               uuid primary key default gen_random_uuid(),
  transaction_id   uuid not null references public.maintenance_transactions(id) on delete cascade,
  from_status      text,
  to_status        text not null,
  changed_by       uuid references public.profiles(id),
  reason           text,
  changed_at       timestamptz not null default now()
);
create index idx_status_history_transaction on public.status_history(transaction_id);

-- -------------------------------------------------------------
-- FUEL_TRANSACTIONS (BBM) — §10
-- -------------------------------------------------------------
create table public.fuel_transactions (
  id                uuid primary key default gen_random_uuid(),
  transaction_date  date not null,
  vehicle_id        uuid not null references public.vehicles(id) on delete restrict,
  fuel_type         text not null,                   -- Pertalite/Pertamax/Solar/dst. (CONFIGURABLE, teks bebas divalidasi di app)
  volume_liters     numeric(10,2) not null check (volume_liters > 0),
  price_per_liter   numeric(12,2) not null check (price_per_liter >= 0),
  total_cost        numeric(18,2) generated always as (volume_liters * price_per_liter) stored,
  odometer_km       numeric(10,1) check (odometer_km >= 0),  -- nullable — §10: jangan hitung konsumsi jika kosong
  provider_name     text,                             -- SPBU/penyedia
  proof_number      text,
  unit_id           uuid not null references public.units(id) on delete restrict,
  notes             text,
  created_by        uuid references public.profiles(id),
  updated_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  deleted_by        uuid references public.profiles(id)
);

create trigger trg_fuel_transactions_updated_at
  before update on public.fuel_transactions
  for each row execute function public.set_updated_at();

create index idx_fuel_vehicle on public.fuel_transactions(vehicle_id);
create index idx_fuel_unit on public.fuel_transactions(unit_id);
create index idx_fuel_date on public.fuel_transactions(transaction_date);
