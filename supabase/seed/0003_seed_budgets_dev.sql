-- =============================================================
-- seed/0003_seed_budgets_dev.sql
-- Contoh pagu anggaran (DEVELOPMENT saja, data dummy) untuk menguji
-- modul Anggaran (Phase 7).
-- =============================================================

do $$
declare
  v_unit_id            uuid;
  v_fiscal_year_id     uuid;
  v_account_pemeliharaan_kendaraan uuid;
  v_account_pemeliharaan_peralatan uuid;
  v_account_pajak      uuid;
begin
  select id into v_unit_id from public.units limit 1;
  select id into v_fiscal_year_id from public.fiscal_years where is_active = true limit 1;
  select id into v_account_pemeliharaan_kendaraan from public.budget_accounts where code = '5.1.02.02.05';
  select id into v_account_pemeliharaan_peralatan from public.budget_accounts where code = '5.1.02.02.01';
  select id into v_account_pajak from public.budget_accounts where code = '5.1.02.02.09';

  if v_unit_id is null or v_fiscal_year_id is null then
    raise notice 'Seed anggaran dilewati: pastikan seed 0001 (unit, tahun anggaran) sudah dijalankan.';
    return;
  end if;

  if v_account_pemeliharaan_kendaraan is not null then
    insert into public.budgets (fiscal_year_id, budget_account_id, unit_id, ceiling_amount, notes)
    values (v_fiscal_year_id, v_account_pemeliharaan_kendaraan, v_unit_id, 50000000, 'Pagu contoh pemeliharaan kendaraan dinas')
    on conflict (fiscal_year_id, budget_account_id, unit_id) do nothing;
  end if;

  if v_account_pemeliharaan_peralatan is not null then
    insert into public.budgets (fiscal_year_id, budget_account_id, unit_id, ceiling_amount, notes)
    values (v_fiscal_year_id, v_account_pemeliharaan_peralatan, v_unit_id, 25000000, 'Pagu contoh pemeliharaan peralatan dan mesin')
    on conflict (fiscal_year_id, budget_account_id, unit_id) do nothing;
  end if;

  if v_account_pajak is not null then
    insert into public.budgets (fiscal_year_id, budget_account_id, unit_id, ceiling_amount, notes)
    values (v_fiscal_year_id, v_account_pajak, v_unit_id, 8000000, 'Pagu contoh pajak kendaraan bermotor')
    on conflict (fiscal_year_id, budget_account_id, unit_id) do nothing;
  end if;

  raise notice 'Seed pagu anggaran contoh berhasil ditambahkan.';
end $$;
