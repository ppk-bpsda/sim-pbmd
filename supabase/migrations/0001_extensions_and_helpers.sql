-- =============================================================
-- 0001_extensions_and_helpers.sql
-- Ekstensi PostgreSQL dan fungsi generik yang dipakai migration lain.
-- =============================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- index pencarian teks (§25 pencarian cepat)

-- -------------------------------------------------------------
-- Fungsi generik: set kolom updated_at = now() setiap kali baris diubah.
-- Dipasang sebagai trigger BEFORE UPDATE di semua tabel yang punya kolom updated_at.
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Mengisi otomatis kolom updated_at = now() pada setiap UPDATE baris.';
