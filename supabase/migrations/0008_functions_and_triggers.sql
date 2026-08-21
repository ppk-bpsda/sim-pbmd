-- =============================================================
-- 0008_functions_and_triggers.sql
-- Fungsi helper otorisasi (dipakai RLS di 0009), trigger audit generik,
-- generator nomor transaksi, pencatat riwayat status, dan penghitung
-- realisasi anggaran otomatis.
--
-- Semua fungsi SECURITY DEFINER dikunci search_path-nya (mencegah
-- search_path hijacking) dan dibuat STABLE/VOLATILE sesuai kebutuhan.
-- =============================================================

-- -------------------------------------------------------------
-- HELPER: apakah user saat ini memiliki salah satu role tsb (di unit mana pun)?
-- -------------------------------------------------------------
create or replace function public.has_role(role_codes text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = any(role_codes)
  );
$$;

-- -------------------------------------------------------------
-- HELPER: daftar unit_id yang menjadi cakupan (scope) user saat ini,
-- berdasarkan user_roles.unit_id (role dengan unit_id NULL berarti lintas unit,
-- ditangani terpisah oleh is_cross_unit_role()).
-- -------------------------------------------------------------
create or replace function public.user_unit_ids()
returns uuid[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(array_agg(distinct ur.unit_id) filter (where ur.unit_id is not null), array[]::uuid[])
  from public.user_roles ur
  where ur.user_id = auth.uid();
$$;

-- -------------------------------------------------------------
-- HELPER: apakah user saat ini punya role yang berhak melihat/mengelola
-- LINTAS seluruh unit kerja (bukan hanya unit sendiri)?
-- -------------------------------------------------------------
create or replace function public.is_cross_unit_role()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_role(array['SUPER_ADMIN','ADMIN','PIMPINAN','AUDITOR']);
$$;

-- -------------------------------------------------------------
-- HELPER: apakah baris dengan unit_id tertentu boleh DIBACA oleh user saat ini?
-- -------------------------------------------------------------
create or replace function public.can_access_unit(target_unit_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_cross_unit_role()
      or target_unit_id = any (public.user_unit_ids());
$$;

comment on function public.has_role(text[]) is 'Dipakai RLS policy: cek role user saat ini.';
comment on function public.user_unit_ids() is 'Dipakai RLS policy: daftar unit yang menjadi cakupan user saat ini.';
comment on function public.can_access_unit(uuid) is 'Dipakai RLS policy: cek akses baca/tulis berdasarkan unit_id baris.';

-- =============================================================
-- AUDIT TRIGGER GENERIK
-- Dipasang di tabel-tabel sensitif. SECURITY DEFINER agar tetap bisa
-- menulis ke audit_logs meskipun role pemanggil tidak memiliki hak INSERT
-- langsung ke audit_logs (lihat RLS 0009: audit_logs tidak punya policy
-- INSERT untuk role aplikasi biasa).
-- =============================================================
create or replace function public.fn_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_record_id uuid;
begin
  if (tg_op = 'INSERT') then
    v_action := 'CREATE';
    v_record_id := new.id;
  elsif (tg_op = 'UPDATE') then
    v_action := 'UPDATE';
    v_record_id := new.id;
  elsif (tg_op = 'DELETE') then
    v_action := 'DELETE';
    v_record_id := old.id;
  end if;

  insert into public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
  values (
    tg_table_name,
    v_record_id,
    v_action,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end,
    auth.uid()
  );

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

comment on function public.fn_audit_log() is
  'Trigger generik: mencatat CREATE/UPDATE/DELETE ke audit_logs. Tidak bisa dilewati dari API karena berjalan di level database.';

-- Pasang trigger audit di tabel-tabel sensitif/transaksional
create trigger trg_audit_assets
  after insert or update or delete on public.assets
  for each row execute function public.fn_audit_log();

create trigger trg_audit_vehicles
  after insert or update or delete on public.vehicles
  for each row execute function public.fn_audit_log();

create trigger trg_audit_maintenance_transactions
  after insert or update or delete on public.maintenance_transactions
  for each row execute function public.fn_audit_log();

create trigger trg_audit_fuel_transactions
  after insert or update or delete on public.fuel_transactions
  for each row execute function public.fn_audit_log();

create trigger trg_audit_budgets
  after insert or update or delete on public.budgets
  for each row execute function public.fn_audit_log();

create trigger trg_audit_user_roles
  after insert or update or delete on public.user_roles
  for each row execute function public.fn_audit_log();

-- =============================================================
-- GENERATOR NOMOR TRANSAKSI OTOMATIS
-- Format: PML/{tahun}/{urutan 4 digit}/{kode unit}
-- CONFIGURABLE: format dapat disesuaikan kemudian tanpa mengubah struktur data,
-- cukup mengubah fungsi ini.
-- =============================================================
create or replace function public.fn_generate_transaction_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int;
  v_unit_code text;
  v_seq int;
begin
  if new.transaction_number is not null then
    return new;
  end if;

  select year into v_year from public.fiscal_years where id = new.fiscal_year_id;
  select code into v_unit_code from public.units where id = new.unit_id;

  select count(*) + 1 into v_seq
  from public.maintenance_transactions
  where fiscal_year_id = new.fiscal_year_id
    and unit_id = new.unit_id;

  new.transaction_number := format('PML/%s/%s/%s', v_year, lpad(v_seq::text, 4, '0'), coalesce(v_unit_code, 'UNIT'));

  return new;
end;
$$;

create trigger trg_generate_transaction_number
  before insert on public.maintenance_transactions
  for each row execute function public.fn_generate_transaction_number();

-- =============================================================
-- RIWAYAT PERUBAHAN STATUS WORKFLOW (§23)
-- =============================================================
create or replace function public.fn_track_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.status_history (transaction_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.status_history (transaction_id, from_status, to_status, changed_by, reason)
    values (new.id, old.status, new.status, auth.uid(), new.rejection_reason);
  end if;
  return new;
end;
$$;

create trigger trg_status_history
  after insert or update on public.maintenance_transactions
  for each row execute function public.fn_track_status_history();

-- =============================================================
-- REALISASI ANGGARAN OTOMATIS (§11, §55)
-- Menghitung ulang budget_realizations setiap kali transaksi pemeliharaan
-- dibuat/diubah, dijumlahkan HANYA dari status APPROVED/POSTED.
-- Transaksi DRAFT/SUBMITTED/VERIFIED/REJECTED/CANCELLED TIDAK dihitung (§11/§33).
-- =============================================================
create or replace function public.fn_recalculate_budget_realization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fiscal_year_id uuid;
  v_budget_account_id uuid;
  v_unit_id uuid;
  v_total numeric(18,2);
begin
  -- Tentukan kombinasi (fiscal_year, budget_account, unit) yang perlu dihitung ulang.
  -- Untuk UPDATE, hitung ulang kombinasi LAMA (jika kombinasi berubah) dan BARU.
  if (tg_op = 'DELETE') then
    v_fiscal_year_id := old.fiscal_year_id;
    v_budget_account_id := old.budget_account_id;
    v_unit_id := old.unit_id;
  else
    v_fiscal_year_id := new.fiscal_year_id;
    v_budget_account_id := new.budget_account_id;
    v_unit_id := new.unit_id;
  end if;

  select coalesce(sum(amount), 0) into v_total
  from public.maintenance_transactions
  where fiscal_year_id = v_fiscal_year_id
    and budget_account_id = v_budget_account_id
    and unit_id = v_unit_id
    and status in ('APPROVED','POSTED')
    and deleted_at is null;

  insert into public.budget_realizations (fiscal_year_id, budget_account_id, unit_id, realized_amount, updated_at)
  values (v_fiscal_year_id, v_budget_account_id, v_unit_id, v_total, now())
  on conflict (fiscal_year_id, budget_account_id, unit_id)
  do update set realized_amount = excluded.realized_amount, updated_at = now();

  -- Jika UPDATE mengubah kombinasi rekening/unit/tahun, hitung ulang juga kombinasi lama.
  if (tg_op = 'UPDATE') and (
       old.fiscal_year_id is distinct from new.fiscal_year_id
    or old.budget_account_id is distinct from new.budget_account_id
    or old.unit_id is distinct from new.unit_id
  ) then
    select coalesce(sum(amount), 0) into v_total
    from public.maintenance_transactions
    where fiscal_year_id = old.fiscal_year_id
      and budget_account_id = old.budget_account_id
      and unit_id = old.unit_id
      and status in ('APPROVED','POSTED')
      and deleted_at is null;

    insert into public.budget_realizations (fiscal_year_id, budget_account_id, unit_id, realized_amount, updated_at)
    values (old.fiscal_year_id, old.budget_account_id, old.unit_id, v_total, now())
    on conflict (fiscal_year_id, budget_account_id, unit_id)
    do update set realized_amount = excluded.realized_amount, updated_at = now();
  end if;

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_recalculate_budget_realization
  after insert or update or delete on public.maintenance_transactions
  for each row execute function public.fn_recalculate_budget_realization();

comment on function public.fn_recalculate_budget_realization() is
  'Menjamin budget_realizations selalu identik dengan hasil agregasi transaksi APPROVED/POSTED — mencegah laporan berbeda dari database (§39.9).';
