-- =============================================================
-- 0009_rls_policies.sql
-- Row Level Security untuk SELURUH tabel (§19, §21, §46). Default policy
-- adalah DENY (RLS aktif tanpa policy = tidak ada yang bisa baca/tulis);
-- setiap izin ditambahkan eksplisit di bawah ini.
-- =============================================================

-- -------------------------------------------------------------
-- GRANT dasar untuk role `authenticated`.
-- RLS membatasi BARIS mana yang boleh diakses, tapi tidak berlaku tanpa
-- hak akses level TABEL terlebih dahulu. Supabase project baru biasanya
-- sudah menyiapkan grant ini secara default, tapi kita buat eksplisit di
-- migration agar schema ini portable/reproducible di lingkungan mana pun
-- (§37: seluruh perubahan database harus lewat migration yang bisa
-- direproduksi, tidak boleh bergantung pada konfigurasi tersembunyi).
-- Role `anon` SENGAJA TIDAK diberi grant apa pun — aplikasi ini tidak
-- punya halaman publik yang mengakses data tanpa login.
-- -------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

-- -------------------------------------------------------------
-- Aktifkan RLS di semua tabel aplikasi
-- -------------------------------------------------------------
alter table public.units                    enable row level security;
alter table public.roles                    enable row level security;
alter table public.permissions              enable row level security;
alter table public.role_permissions         enable row level security;
alter table public.profiles                 enable row level security;
alter table public.user_roles               enable row level security;
alter table public.asset_categories         enable row level security;
alter table public.asset_types              enable row level security;
alter table public.vehicle_categories       enable row level security;
alter table public.maintenance_types        enable row level security;
alter table public.vendors                  enable row level security;
alter table public.funding_sources          enable row level security;
alter table public.fiscal_years             enable row level security;
alter table public.programs                 enable row level security;
alter table public.activities               enable row level security;
alter table public.subactivities            enable row level security;
alter table public.budget_accounts          enable row level security;
alter table public.assets                   enable row level security;
alter table public.vehicles                 enable row level security;
alter table public.vehicle_documents        enable row level security;
alter table public.budgets                  enable row level security;
alter table public.budget_realizations      enable row level security;
alter table public.maintenance_transactions enable row level security;
alter table public.maintenance_details      enable row level security;
alter table public.status_history           enable row level security;
alter table public.fuel_transactions        enable row level security;
alter table public.attachments              enable row level security;
alter table public.notifications            enable row level security;
alter table public.import_batches           enable row level security;
alter table public.import_errors            enable row level security;
alter table public.audit_logs               enable row level security;

-- Paksa RLS berlaku juga untuk pemilik tabel (mis. saat diakses lewat service role
-- yang keliru dikonfigurasi) kecuali pada tabel yang memang butuh trigger SECURITY
-- DEFINER menembus RLS (audit_logs, status_history, budget_realizations) — trigger
-- tsb SECURITY DEFINER milik fungsi, bukan milik role sesi, sehingga tetap berjalan.

-- =============================================================
-- PROFILES & USER_ROLES
-- =============================================================
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using ( id = auth.uid() or public.has_role(array['SUPER_ADMIN','ADMIN','PIMPINAN','AUDITOR']) );

create policy profiles_update_self_limited on public.profiles
  for update to authenticated
  using ( id = auth.uid() )
  with check ( id = auth.uid() );

create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) )
  with check ( public.has_role(array['SUPER_ADMIN','ADMIN']) );

create policy user_roles_select on public.user_roles
  for select to authenticated
  using ( user_id = auth.uid() or public.has_role(array['SUPER_ADMIN','ADMIN','AUDITOR']) );

create policy user_roles_admin_manage on public.user_roles
  for all to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) )
  with check ( public.has_role(array['SUPER_ADMIN','ADMIN']) );

-- =============================================================
-- MASTER DATA — pola seragam: SEMUA user terautentikasi boleh baca,
-- hanya ADMIN/SUPER_ADMIN boleh tulis (§24). Diterapkan via loop agar
-- konsisten dan tidak ada tabel master yang terlewat.
-- =============================================================
do $$
declare
  t text;
  master_tables text[] := array[
    'units','roles','permissions','asset_categories','asset_types',
    'vehicle_categories','maintenance_types','vendors','funding_sources',
    'fiscal_years','programs','activities','subactivities','budget_accounts'
  ];
begin
  foreach t in array master_tables loop
    execute format(
      'create policy %I_select_all on public.%I for select to authenticated using (true);',
      t, t
    );
    execute format(
      'create policy %I_admin_write on public.%I for all to authenticated
         using (public.has_role(array[''SUPER_ADMIN'',''ADMIN'']))
         with check (public.has_role(array[''SUPER_ADMIN'',''ADMIN'']));',
      t, t
    );
  end loop;
end $$;

-- role_permissions: dibaca ADMIN/SUPER_ADMIN saja (detail RBAC internal)
create policy role_permissions_admin_only on public.role_permissions
  for all to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) )
  with check ( public.has_role(array['SUPER_ADMIN','ADMIN']) );

-- =============================================================
-- ASSETS (Master BMD)
-- =============================================================
create policy assets_select on public.assets
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

create policy assets_insert on public.assets
  for insert to authenticated
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  );

create policy assets_update on public.assets
  for update to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  );

-- Hanya ADMIN/SUPER_ADMIN boleh hapus (soft delete via UPDATE deleted_at, bukan DELETE fisik)
create policy assets_delete_admin_only on public.assets
  for delete to authenticated
  using ( public.has_role(array['SUPER_ADMIN']) );

-- =============================================================
-- VEHICLES & VEHICLE_DOCUMENTS (mengikuti unit_id milik assets terkait)
-- =============================================================
create policy vehicles_select on public.vehicles
  for select to authenticated
  using ( public.can_access_unit((select unit_id from public.assets where assets.id = vehicles.id)) );

create policy vehicles_write on public.vehicles
  for all to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR'])
        and (select unit_id from public.assets where assets.id = vehicles.id) = any (public.user_unit_ids()))
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR'])
        and (select unit_id from public.assets where assets.id = vehicles.id) = any (public.user_unit_ids()))
  );

create policy vehicle_documents_select on public.vehicle_documents
  for select to authenticated
  using (
    public.can_access_unit((
      select a.unit_id from public.assets a where a.id = vehicle_documents.vehicle_id
    ))
  );

create policy vehicle_documents_write on public.vehicle_documents
  for all to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and (
      select a.unit_id from public.assets a where a.id = vehicle_documents.vehicle_id
    ) = any (public.user_unit_ids()))
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and (
      select a.unit_id from public.assets a where a.id = vehicle_documents.vehicle_id
    ) = any (public.user_unit_ids()))
  );

-- =============================================================
-- MAINTENANCE_TRANSACTIONS — inti workflow (§23)
-- =============================================================
create policy mt_select on public.maintenance_transactions
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

-- OPERATOR hanya boleh membuat transaksi berstatus DRAFT/SUBMITTED di unit sendiri
create policy mt_insert_operator on public.maintenance_transactions
  for insert to authenticated
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (
      public.has_role(array['OPERATOR'])
      and unit_id = any (public.user_unit_ids())
      and status in ('DRAFT','SUBMITTED')
    )
  );

-- OPERATOR hanya boleh mengubah transaksi miliknya SELAMA masih DRAFT/SUBMITTED
-- (setelah VERIFIED, hanya VERIFIKATOR/ADMIN yang boleh mengubah status berikutnya)
create policy mt_update_operator on public.maintenance_transactions
  for update to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (
      public.has_role(array['OPERATOR'])
      and unit_id = any (public.user_unit_ids())
      and status in ('DRAFT','SUBMITTED')
    )
    or (
      public.has_role(array['VERIFIKATOR'])
      and unit_id = any (public.user_unit_ids())
      and status in ('SUBMITTED','VERIFIED')
    )
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (
      public.has_role(array['OPERATOR'])
      and unit_id = any (public.user_unit_ids())
    )
    or (
      public.has_role(array['VERIFIKATOR'])
      and unit_id = any (public.user_unit_ids())
    )
  );

create policy mt_delete_admin_only on public.maintenance_transactions
  for delete to authenticated
  using ( public.has_role(array['SUPER_ADMIN']) );

-- MAINTENANCE_DETAILS & STATUS_HISTORY mengikuti hak akses transaksi induknya
create policy maintenance_details_select on public.maintenance_details
  for select to authenticated
  using (
    public.can_access_unit((
      select unit_id from public.maintenance_transactions mt where mt.id = maintenance_details.transaction_id
    ))
  );

create policy maintenance_details_write on public.maintenance_details
  for all to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and (
      select unit_id from public.maintenance_transactions mt where mt.id = maintenance_details.transaction_id
    ) = any (public.user_unit_ids()))
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and (
      select unit_id from public.maintenance_transactions mt where mt.id = maintenance_details.transaction_id
    ) = any (public.user_unit_ids()))
  );

-- status_history hanya bisa DIBACA lewat aplikasi; penulisan HANYA lewat trigger
-- SECURITY DEFINER (fn_track_status_history), sehingga tidak diberi policy INSERT/UPDATE.
create policy status_history_select on public.status_history
  for select to authenticated
  using (
    public.can_access_unit((
      select unit_id from public.maintenance_transactions mt where mt.id = status_history.transaction_id
    ))
  );

-- =============================================================
-- FUEL_TRANSACTIONS
-- =============================================================
create policy fuel_select on public.fuel_transactions
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

create policy fuel_insert on public.fuel_transactions
  for insert to authenticated
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  );

create policy fuel_update on public.fuel_transactions
  for update to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  )
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  );

create policy fuel_delete_admin_only on public.fuel_transactions
  for delete to authenticated
  using ( public.has_role(array['SUPER_ADMIN']) );

-- =============================================================
-- BUDGETS (pagu) — baca semua, tulis hanya ADMIN/SUPER_ADMIN
-- =============================================================
create policy budgets_select on public.budgets
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

create policy budgets_admin_write on public.budgets
  for all to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) )
  with check ( public.has_role(array['SUPER_ADMIN','ADMIN']) );

-- =============================================================
-- BUDGET_REALIZATIONS — READ ONLY untuk semua role via aplikasi.
-- SENGAJA TIDAK ADA policy INSERT/UPDATE/DELETE untuk role apa pun:
-- baris hanya diisi oleh trigger fn_recalculate_budget_realization
-- yang berjalan SECURITY DEFINER (menembus RLS by design, bukan karena bug).
-- =============================================================
create policy budget_realizations_select on public.budget_realizations
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

-- =============================================================
-- ATTACHMENTS
-- =============================================================
create policy attachments_select on public.attachments
  for select to authenticated
  using ( public.can_access_unit(unit_id) );

create policy attachments_insert on public.attachments
  for insert to authenticated
  with check (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()))
  );

create policy attachments_delete on public.attachments
  for delete to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (public.has_role(array['OPERATOR']) and unit_id = any (public.user_unit_ids()) and uploaded_by = auth.uid())
  );

-- =============================================================
-- NOTIFICATIONS — hanya pemilik notifikasi yang boleh baca/menandai dibaca
-- =============================================================
create policy notifications_select_own on public.notifications
  for select to authenticated
  using ( user_id = auth.uid() );

create policy notifications_update_own on public.notifications
  for update to authenticated
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

-- =============================================================
-- IMPORT_BATCHES & IMPORT_ERRORS
-- =============================================================
create policy import_batches_select on public.import_batches
  for select to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) or unit_id = any (public.user_unit_ids()) );

create policy import_batches_write on public.import_batches
  for all to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN']) )
  with check ( public.has_role(array['SUPER_ADMIN','ADMIN']) );

create policy import_errors_select on public.import_errors
  for select to authenticated
  using (
    public.has_role(array['SUPER_ADMIN','ADMIN'])
    or (select unit_id from public.import_batches b where b.id = import_errors.batch_id) = any (public.user_unit_ids())
  );

-- =============================================================
-- AUDIT_LOGS — READ ONLY. Hanya ADMIN/SUPER_ADMIN/AUDITOR yang boleh baca.
-- SENGAJA TIDAK ADA policy INSERT/UPDATE/DELETE untuk role aplikasi mana pun.
-- Baris hanya ditulis oleh trigger fn_audit_log (SECURITY DEFINER).
-- =============================================================
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using ( public.has_role(array['SUPER_ADMIN','ADMIN','AUDITOR']) );
