-- =============================================================
-- 0002_units_rbac_profiles.sql
-- Unit kerja, role-based access control, dan profil pengguna.
-- =============================================================

-- -------------------------------------------------------------
-- UNITS (Unit Kerja / OPD)
-- -------------------------------------------------------------
create table public.units (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  name            text not null,
  parent_unit_id  uuid references public.units(id),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.units is 'Unit kerja/OPD. Mendukung hierarki via parent_unit_id.';

create trigger trg_units_updated_at
  before update on public.units
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- ROLES & PERMISSIONS (RBAC)
-- Role minimal sesuai §19 dokumen sumber. is_system=true mencegah
-- role inti dihapus lewat aplikasi, namun ADMIN tetap bisa menambah
-- role baru non-system bila dibutuhkan di kemudian hari.
-- -------------------------------------------------------------
create table public.roles (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,   -- SUPER_ADMIN, ADMIN, OPERATOR, VERIFIKATOR, PIMPINAN, AUDITOR
  name          text not null,
  description   text,
  is_system     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.permissions (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,   -- mis. 'maintenance.approve', 'budget.manage'
  description   text
);

create table public.role_permissions (
  role_id        uuid not null references public.roles(id) on delete cascade,
  permission_id  uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- -------------------------------------------------------------
-- PROFILES
-- Diperluas dari auth.users milik Supabase. unit_id = unit kerja utama
-- (home unit) pengguna; boleh NULL untuk role lintas-unit (SUPER_ADMIN,
-- ADMIN, PIMPINAN, AUDITOR).
-- -------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  nip           text,                 -- Nomor Induk Pegawai (opsional)
  phone         text,
  unit_id       uuid references public.units(id),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.profiles is 'Profil pengguna, 1:1 dengan auth.users.';

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- USER_ROLES
-- Junction many-to-many user <-> role. unit_id di sini adalah CAKUPAN
-- (scope) penugasan role tsb: NULL berarti berlaku lintas seluruh unit
-- (wajar untuk SUPER_ADMIN/ADMIN/PIMPINAN/AUDITOR), diisi berarti role
-- tsb hanya berlaku untuk unit tersebut (wajar untuk OPERATOR/VERIFIKATOR).
-- -------------------------------------------------------------
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role_id     uuid not null references public.roles(id) on delete restrict,
  unit_id     uuid references public.units(id),
  granted_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  unique (user_id, role_id, unit_id)
);

create index idx_user_roles_user on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role_id);

-- -------------------------------------------------------------
-- Trigger: otomatis buat baris profiles saat ada user baru di auth.users.
-- full_name diambil dari raw_user_meta_data (diisi form registrasi/undangan admin).
-- -------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Pengguna Baru'));
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
