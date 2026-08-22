-- =============================================================
-- 0011_vehicle_budget_policies.sql
-- Alokasi anggaran pemeliharaan+BBM PER KENDARAAN (bukan hardcode di kode
-- aplikasi — §CONFIGURABLE). Contoh kebijakan riil yang mendasari desain ini:
--   Motor dinas       : Rp3.450.000/motor/tahun, jatah BBM Rp200.000/bulan
--                        -> sisa Rp1.050.000/tahun untuk pemeliharaan.
--   Mobil dinas        : alokasi berbeda per kendaraan (perorangan vs
--                        penumpang) karena jatah BBM keduanya berbeda
--                        (Rp1.500.000 vs Rp500.000/bulan) meski berasal
--                        dari satu pagu gabungan Rp33.600.000/tahun untuk
--                        2 unit — karena itu alokasi disimpan PER KENDARAAN,
--                        bukan per kategori, supaya angka yang berbeda-beda
--                        ini bisa direpresentasikan dengan tepat.
-- Admin dapat menerapkan nilai yang sama ke banyak kendaraan sekaligus lewat
-- fitur "Terapkan ke Kategori" di aplikasi tanpa mengubah desain tabel ini.
-- =============================================================

create table public.vehicle_budget_policies (
  id                            uuid primary key default gen_random_uuid(),
  vehicle_id                    uuid not null references public.vehicles(id) on delete cascade,
  fiscal_year_id                uuid not null references public.fiscal_years(id) on delete restrict,
  monthly_fuel_allocation       numeric(14,2) not null check (monthly_fuel_allocation >= 0),
  annual_maintenance_allocation numeric(14,2) not null check (annual_maintenance_allocation >= 0),
  -- Pagu tahunan total = (jatah BBM x 12 bulan) + alokasi pemeliharaan tahunan.
  -- Dihitung DATABASE (generated column), bukan dihitung ulang di frontend,
  -- supaya tidak pernah berbeda dari sumbernya (§39.9 / §55).
  annual_total_budget           numeric(14,2) generated always as
                                   ((monthly_fuel_allocation * 12) + annual_maintenance_allocation) stored,
  notes                         text,
  created_by                    uuid references public.profiles(id),
  updated_by                    uuid references public.profiles(id),
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  unique (vehicle_id, fiscal_year_id)
);

create trigger trg_vehicle_budget_policies_updated_at
  before update on public.vehicle_budget_policies
  for each row execute function public.set_updated_at();

create index idx_vbp_vehicle on public.vehicle_budget_policies(vehicle_id);
create index idx_vbp_fiscal_year on public.vehicle_budget_policies(fiscal_year_id);

alter table public.vehicle_budget_policies enable row level security;

-- Baca: semua user terautentikasi (sama seperti tabel budgets lain).
create policy vbp_select on public.vehicle_budget_policies
  for select to authenticated using (true);

-- Tulis: hanya ADMIN/SUPER_ADMIN — ini kebijakan anggaran, bukan transaksi
-- operasional harian.
create policy vbp_admin_write on public.vehicle_budget_policies
  for all to authenticated
  using (public.has_role(array['SUPER_ADMIN','ADMIN']))
  with check (public.has_role(array['SUPER_ADMIN','ADMIN']));

comment on table public.vehicle_budget_policies is
  'Alokasi anggaran pemeliharaan+BBM per kendaraan per tahun anggaran, CONFIGURABLE lewat menu admin (§CONFIGURABLE) — bukan nilai hardcode.';

-- =============================================================
-- VIEW: vehicle_budget_summary
-- Rekap per kendaraan (Noka/Nosin/Nopol) x tahun anggaran:
--   - jumlah & total transaksi pemeliharaan (APPROVED/POSTED saja)
--   - jumlah & total transaksi BBM
--   - pagu, realisasi gabungan, sisa, dan persentase realisasi
-- Dibuat sebagai VIEW (bukan dihitung berulang di aplikasi) supaya angka
-- laporan selalu identik dengan hasil agregasi database (§39.9, §55).
--
-- security_invoker = true (butuh PostgreSQL 15+, tersedia di Supabase sejak
-- 2023) — artinya view ini TIDAK butuh RLS policy sendiri; ia otomatis
-- tunduk pada RLS tabel-tabel yang direferensikannya (assets, vehicles,
-- maintenance_transactions, fuel_transactions) untuk user yang memanggilnya.
-- =============================================================
create view public.vehicle_budget_summary
with (security_invoker = true) as
select
  v.id                                   as vehicle_id,
  a.name                                 as vehicle_name,
  v.plate_number,
  v.chassis_number,
  v.engine_number,
  v.status                               as vehicle_status,
  vc.id                                  as vehicle_category_id,
  vc.name                                as vehicle_category_name,
  a.unit_id,
  u.name                                 as unit_name,
  fy.id                                  as fiscal_year_id,
  fy.year                                as fiscal_year,
  coalesce(mt.maintenance_count, 0)      as maintenance_count,
  coalesce(mt.maintenance_total, 0)      as maintenance_total,
  coalesce(ft.fuel_count, 0)             as fuel_count,
  coalesce(ft.fuel_total, 0)             as fuel_total,
  coalesce(mt.maintenance_total, 0) + coalesce(ft.fuel_total, 0)
                                          as total_realization,
  vbp.monthly_fuel_allocation,
  vbp.annual_maintenance_allocation,
  vbp.annual_total_budget,
  case
    when vbp.annual_total_budget is not null then
      vbp.annual_total_budget - (coalesce(mt.maintenance_total, 0) + coalesce(ft.fuel_total, 0))
    else null
  end                                     as remaining_budget,
  case
    when vbp.annual_total_budget is not null and vbp.annual_total_budget > 0 then
      round(
        (coalesce(mt.maintenance_total, 0) + coalesce(ft.fuel_total, 0))
        / vbp.annual_total_budget * 100, 2
      )
    else null
  end                                     as realization_percentage
from public.vehicles v
join public.assets a
  on a.id = v.id and a.deleted_at is null
left join public.vehicle_categories vc
  on vc.id = v.vehicle_category_id
left join public.units u
  on u.id = a.unit_id
cross join public.fiscal_years fy
left join lateral (
  select
    count(*)                     as maintenance_count,
    coalesce(sum(mtx.amount), 0) as maintenance_total
  from public.maintenance_transactions mtx
  where mtx.asset_id = v.id
    and mtx.fiscal_year_id = fy.id
    and mtx.status in ('APPROVED', 'POSTED')
    and mtx.deleted_at is null
) mt on true
left join lateral (
  select
    count(*)                        as fuel_count,
    coalesce(sum(ftx.total_cost), 0) as fuel_total
  from public.fuel_transactions ftx
  where ftx.vehicle_id = v.id
    and extract(year from ftx.transaction_date) = fy.year
    and ftx.deleted_at is null
) ft on true
left join public.vehicle_budget_policies vbp
  on vbp.vehicle_id = v.id and vbp.fiscal_year_id = fy.id;

grant select on public.vehicle_budget_summary to authenticated;

comment on view public.vehicle_budget_summary is
  'Rekap per kendaraan x tahun anggaran: jumlah pemeliharaan, jumlah BBM, realisasi, pagu, sisa, %. Sumber tunggal untuk halaman /vehicles/rekap (§54-55 traceability).';
