-- =============================================================
-- 0003_master_data.sql
-- Master data yang HARUS bisa ditambah/diubah administrator tanpa
-- mengubah source code (§5, §7, §24 dokumen sumber).
-- =============================================================

-- -------------------------------------------------------------
-- ASSET_CATEGORIES & ASSET_TYPES
-- Kategori: Kendaraan, Komputer/TI, Peralatan Kantor, Mebel, dst.
-- Type: sub-jenis di dalam kategori (mis. "Laptop" di kategori "Komputer dan TI").
-- -------------------------------------------------------------
create table public.asset_categories (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_asset_categories_updated_at
  before update on public.asset_categories
  for each row execute function public.set_updated_at();

create table public.asset_types (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.asset_categories(id) on delete restrict,
  code          text not null,
  name          text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category_id, code)
);
create trigger trg_asset_types_updated_at
  before update on public.asset_types
  for each row execute function public.set_updated_at();
create index idx_asset_types_category on public.asset_types(category_id);

-- -------------------------------------------------------------
-- VEHICLE_CATEGORIES (§5: Perorangan, Penumpang, Roda Dua, Roda Tiga,
-- Operasional, Lapangan, Lainnya) — tabel terpisah agar admin bisa
-- menambah jenis kendaraan baru tanpa ubah kode.
-- -------------------------------------------------------------
create table public.vehicle_categories (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  is_active   boolean not null default true
);

-- -------------------------------------------------------------
-- MAINTENANCE_TYPES (§7)
-- -------------------------------------------------------------
create table public.maintenance_types (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_maintenance_types_updated_at
  before update on public.maintenance_types
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- VENDORS (Penyedia)
-- -------------------------------------------------------------
create table public.vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  email       text,
  npwp        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_vendors_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();
create index idx_vendors_name_trgm on public.vendors using gin (name gin_trgm_ops);

-- -------------------------------------------------------------
-- FUNDING_SOURCES (Sumber Dana)
-- -------------------------------------------------------------
create table public.funding_sources (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  is_active   boolean not null default true
);

-- -------------------------------------------------------------
-- FISCAL_YEARS (Tahun Anggaran)
-- -------------------------------------------------------------
create table public.fiscal_years (
  id          uuid primary key default gen_random_uuid(),
  year        integer not null unique check (year between 2000 and 2100),
  is_active   boolean not null default true,   -- tahun anggaran berjalan
  is_locked   boolean not null default false    -- terkunci = tidak bisa transaksi baru
);

-- -------------------------------------------------------------
-- PROGRAMS / ACTIVITIES / SUBACTIVITIES (struktur perencanaan anggaran)
-- -------------------------------------------------------------
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  is_active   boolean not null default true
);

create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete restrict,
  code        text not null,
  name        text not null,
  is_active   boolean not null default true,
  unique (program_id, code)
);
create index idx_activities_program on public.activities(program_id);

create table public.subactivities (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references public.activities(id) on delete restrict,
  code          text not null,
  name          text not null,
  is_active     boolean not null default true,
  unique (activity_id, code)
);
create index idx_subactivities_activity on public.subactivities(activity_id);

-- -------------------------------------------------------------
-- BUDGET_ACCOUNTS (Master Rekening Belanja)
-- -------------------------------------------------------------
create table public.budget_accounts (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,   -- kode rekening, mis. 5.1.02.02
  name        text not null,          -- uraian rekening
  is_active   boolean not null default true
);
