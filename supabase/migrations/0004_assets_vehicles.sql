-- =============================================================
-- 0004_assets_vehicles.sql
-- Master BMD (KIB B), kendaraan (extends assets), dan dokumen kendaraan.
-- =============================================================

-- -------------------------------------------------------------
-- ASSETS (Master BMD / KIB B) — §4
-- -------------------------------------------------------------
create table public.assets (
  id                  uuid primary key default gen_random_uuid(),
  asset_code          text not null,               -- kode barang
  register_number     text not null,                -- nomor register
  name                text not null,                -- nama barang
  category_id         uuid not null references public.asset_categories(id) on delete restrict,
  type_id             uuid references public.asset_types(id) on delete restrict,
  brand               text,                          -- merk
  model               text,                          -- tipe
  size_spec           text,                          -- ukuran
  material            text,                          -- bahan
  acquisition_year    integer check (acquisition_year between 1900 and 2100),
  condition           text not null default 'BAIK'
                        check (condition in ('BAIK','RUSAK_RINGAN','RUSAK_BERAT')),
  quantity            numeric(12,2) not null default 1 check (quantity > 0),
  unit_of_measure     text,                          -- satuan
  acquisition_value   numeric(18,2) check (acquisition_value >= 0),
  book_value          numeric(18,2) check (book_value >= 0),
  location            text,
  holder_name         text,                          -- pengguna/pemegang barang
  unit_id             uuid not null references public.units(id) on delete restrict,
  notes               text,
  is_active           boolean not null default true,
  created_by          uuid references public.profiles(id),
  updated_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  deleted_by          uuid references public.profiles(id),
  unique (asset_code, register_number)               -- §18 deteksi duplikasi
);

create trigger trg_assets_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

create index idx_assets_unit on public.assets(unit_id);
create index idx_assets_category on public.assets(category_id);
create index idx_assets_active on public.assets(is_active) where deleted_at is null;
create index idx_assets_name_trgm on public.assets using gin (name gin_trgm_ops);
create index idx_assets_code_trgm on public.assets using gin (asset_code gin_trgm_ops);

comment on column public.assets.deleted_at is
  'Soft delete (§32) — data yang sudah dipakai transaksi tidak boleh dihapus permanen.';

-- -------------------------------------------------------------
-- VEHICLES — 1:1 extends assets (shared primary key pattern).
-- Hanya dipakai untuk asset berkategori Kendaraan.
-- -------------------------------------------------------------
create table public.vehicles (
  id                 uuid primary key references public.assets(id) on delete cascade,
  vehicle_category_id uuid not null references public.vehicle_categories(id) on delete restrict,
  plate_number       text not null unique,           -- nomor polisi
  chassis_number     text,                            -- nomor rangka
  engine_number      text,                             -- nomor mesin
  bpkb_number        text,
  stnk_number        text,
  color              text,
  status             text not null default 'AKTIF'
                        check (status in ('AKTIF','TIDAK_AKTIF','DALAM_PERBAIKAN','DIHAPUS')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger trg_vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create index idx_vehicles_plate_trgm on public.vehicles using gin (plate_number gin_trgm_ops);
create index idx_vehicles_status on public.vehicles(status);

-- -------------------------------------------------------------
-- VEHICLE_DOCUMENTS — STNK / Pajak / KIR / BPKB (untuk alert jatuh tempo, §35)
-- -------------------------------------------------------------
create table public.vehicle_documents (
  id                    uuid primary key default gen_random_uuid(),
  vehicle_id            uuid not null references public.vehicles(id) on delete cascade,
  document_type         text not null
                          check (document_type in ('STNK','PAJAK','KIR','BPKB','LAINNYA')),
  document_number       text,
  issued_date           date,
  expiry_date           date,
  reminder_days_before  integer not null default 30,  -- CONFIGURABLE oleh admin
  notes                 text,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_vehicle_documents_updated_at
  before update on public.vehicle_documents
  for each row execute function public.set_updated_at();

create index idx_vehicle_documents_vehicle on public.vehicle_documents(vehicle_id);
create index idx_vehicle_documents_expiry on public.vehicle_documents(expiry_date);
