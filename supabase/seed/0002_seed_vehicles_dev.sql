-- =============================================================
-- seed/0002_seed_vehicles_dev.sql
-- Data contoh kendaraan (DEVELOPMENT saja, data dummy) untuk menguji
-- modul Kendaraan + alokasi anggaran (Phase 6). Skenario mengikuti
-- kebijakan yang diberikan:
--   - Motor dinas   : Rp3.450.000/motor/tahun, BBM Rp200.000/bulan
--                     -> pemeliharaan Rp1.050.000/tahun.
--   - Mobil dinas    : total Rp33.600.000/tahun untuk 2 unit, dengan BBM
--                      berbeda per unit (perorangan Rp1.500.000/bulan,
--                      penumpang Rp500.000/bulan) -> pemeliharaan dihitung
--                      proporsional dari sisa (lihat catatan di bawah).
-- JANGAN dijalankan di project Supabase PRODUCTION.
-- =============================================================

do $$
declare
  v_kendaraan_category_id   uuid;
  v_unit_id                 uuid;
  v_r2_category_id          uuid;
  v_perorangan_category_id  uuid;
  v_penumpang_category_id   uuid;
  v_fiscal_year_id          uuid;
  v_asset_id                uuid;
  v_motor1_id               uuid;
  v_motor2_id               uuid;
  v_mobil_perorangan_id     uuid;
  v_mobil_penumpang_id      uuid;
begin
  select id into v_kendaraan_category_id from public.asset_categories where code = 'KENDARAAN';
  select id into v_unit_id from public.units limit 1;
  select id into v_r2_category_id from public.vehicle_categories where code = 'RODA_DUA';
  select id into v_perorangan_category_id from public.vehicle_categories where code = 'PERORANGAN';
  select id into v_penumpang_category_id from public.vehicle_categories where code = 'PENUMPANG';
  select id into v_fiscal_year_id from public.fiscal_years where is_active = true limit 1;

  if v_kendaraan_category_id is null or v_unit_id is null or v_fiscal_year_id is null then
    raise notice 'Seed kendaraan dilewati: pastikan seed 0001 (kategori aset, unit, tahun anggaran) sudah dijalankan.';
    return;
  end if;

  -- ---------- MOTOR DINAS #1 ----------
  insert into public.assets (asset_code, register_number, name, category_id, brand, model, acquisition_year, condition, quantity, unit_of_measure, unit_id)
  values ('KEND-R2-001', 'REG-R2-001', 'Sepeda Motor Dinas Honda Beat', v_kendaraan_category_id, 'Honda', 'Beat', 2023, 'BAIK', 1, 'Unit', v_unit_id)
  returning id into v_motor1_id;

  insert into public.vehicles (id, vehicle_category_id, plate_number, chassis_number, engine_number, status)
  values (v_motor1_id, v_r2_category_id, 'B 3001 XYZ', 'MHNOKA00001XX', 'MHNOSIN00001XX', 'AKTIF');

  insert into public.vehicle_budget_policies (vehicle_id, fiscal_year_id, monthly_fuel_allocation, annual_maintenance_allocation, notes)
  values (v_motor1_id, v_fiscal_year_id, 200000, 1050000, 'Kebijakan motor dinas: Rp3.450.000/tahun (BBM Rp200rb/bulan + pemeliharaan Rp1.050.000/tahun)');

  -- ---------- MOTOR DINAS #2 ----------
  insert into public.assets (asset_code, register_number, name, category_id, brand, model, acquisition_year, condition, quantity, unit_of_measure, unit_id)
  values ('KEND-R2-002', 'REG-R2-002', 'Sepeda Motor Dinas Honda Beat', v_kendaraan_category_id, 'Honda', 'Beat', 2023, 'BAIK', 1, 'Unit', v_unit_id)
  returning id into v_motor2_id;

  insert into public.vehicles (id, vehicle_category_id, plate_number, chassis_number, engine_number, status)
  values (v_motor2_id, v_r2_category_id, 'B 3002 XYZ', 'MHNOKA00002XX', 'MHNOSIN00002XX', 'AKTIF');

  insert into public.vehicle_budget_policies (vehicle_id, fiscal_year_id, monthly_fuel_allocation, annual_maintenance_allocation, notes)
  values (v_motor2_id, v_fiscal_year_id, 200000, 1050000, 'Kebijakan motor dinas: Rp3.450.000/tahun (BBM Rp200rb/bulan + pemeliharaan Rp1.050.000/tahun)');

  -- ---------- MOBIL DINAS PERORANGAN ----------
  -- Catatan alokasi: pagu gabungan 2 mobil = Rp33.600.000/tahun. BBM keduanya
  -- berbeda (perorangan Rp1.500.000/bln = Rp18.000.000/thn, penumpang
  -- Rp500.000/bln = Rp6.000.000/thn -> total BBM Rp24.000.000/thn). Sisa
  -- pemeliharaan gabungan = Rp9.600.000/thn. ASUMSI dibagi rata 2 kendaraan
  -- (Rp4.800.000/unit) karena tidak ada rincian pembagian lain dari
  -- kebijakan yang diberikan — SILAKAN SESUAIKAN di halaman detail
  -- kendaraan masing-masing (§CONFIGURABLE) bila pembagiannya berbeda.
  if v_perorangan_category_id is not null then
    insert into public.assets (asset_code, register_number, name, category_id, brand, model, acquisition_year, condition, quantity, unit_of_measure, unit_id)
    values ('KEND-R4-001', 'REG-R4-001', 'Mobil Dinas Perorangan Toyota Innova', v_kendaraan_category_id, 'Toyota', 'Innova', 2022, 'BAIK', 1, 'Unit', v_unit_id)
    returning id into v_mobil_perorangan_id;

    insert into public.vehicles (id, vehicle_category_id, plate_number, chassis_number, engine_number, status)
    values (v_mobil_perorangan_id, v_perorangan_category_id, 'B 4001 XYZ', 'MHNOKA00003XX', 'MHNOSIN00003XX', 'AKTIF');

    insert into public.vehicle_budget_policies (vehicle_id, fiscal_year_id, monthly_fuel_allocation, annual_maintenance_allocation, notes)
    values (v_mobil_perorangan_id, v_fiscal_year_id, 1500000, 4800000, 'Bagian dari pagu gabungan Rp33.600.000/tahun untuk 2 mobil dinas — pemeliharaan diasumsikan dibagi rata, sesuaikan bila perlu.');
  end if;

  -- ---------- MOBIL DINAS PENUMPANG ----------
  if v_penumpang_category_id is not null then
    insert into public.assets (asset_code, register_number, name, category_id, brand, model, acquisition_year, condition, quantity, unit_of_measure, unit_id)
    values ('KEND-R4-002', 'REG-R4-002', 'Mobil Dinas Penumpang Toyota Avanza', v_kendaraan_category_id, 'Toyota', 'Avanza', 2022, 'BAIK', 1, 'Unit', v_unit_id)
    returning id into v_mobil_penumpang_id;

    insert into public.vehicles (id, vehicle_category_id, plate_number, chassis_number, engine_number, status)
    values (v_mobil_penumpang_id, v_penumpang_category_id, 'B 4002 XYZ', 'MHNOKA00004XX', 'MHNOSIN00004XX', 'AKTIF');

    insert into public.vehicle_budget_policies (vehicle_id, fiscal_year_id, monthly_fuel_allocation, annual_maintenance_allocation, notes)
    values (v_mobil_penumpang_id, v_fiscal_year_id, 500000, 4800000, 'Bagian dari pagu gabungan Rp33.600.000/tahun untuk 2 mobil dinas — pemeliharaan diasumsikan dibagi rata, sesuaikan bila perlu.');
  end if;

  raise notice 'Seed kendaraan contoh berhasil ditambahkan.';
end $$;
