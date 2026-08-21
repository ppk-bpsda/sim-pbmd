-- =============================================================
-- 0001_seed_dev.sql
-- Data awal untuk DEVELOPMENT saja. Semua data di bawah adalah data
-- dummy/contoh (§38) — JANGAN dipakai di project Supabase production.
-- =============================================================

-- -------------------------------------------------------------
-- ROLES (§19)
-- -------------------------------------------------------------
insert into public.roles (code, name, description, is_system) values
  ('SUPER_ADMIN', 'Super Admin', 'Memiliki seluruh akses sistem.', true),
  ('ADMIN',       'Admin',       'Mengelola master data dan transaksi.', true),
  ('OPERATOR',    'Operator',    'Input transaksi dan melihat data unit kerjanya.', true),
  ('VERIFIKATOR', 'Verifikator', 'Memeriksa dan memvalidasi transaksi.', true),
  ('PIMPINAN',    'Pimpinan',    'Read-only dashboard dan laporan.', true),
  ('AUDITOR',     'Auditor',     'Read-only data dan audit trail.', true);

-- -------------------------------------------------------------
-- PERMISSIONS contoh (granular, dipakai untuk kontrol UI tambahan di luar RLS)
-- -------------------------------------------------------------
insert into public.permissions (code, description) values
  ('maintenance.create',  'Membuat transaksi pemeliharaan'),
  ('maintenance.verify',  'Memverifikasi transaksi pemeliharaan'),
  ('maintenance.approve', 'Menyetujui transaksi pemeliharaan'),
  ('budget.manage',       'Mengelola pagu anggaran'),
  ('master.manage',       'Mengelola seluruh master data'),
  ('audit.view',          'Melihat audit trail');

-- -------------------------------------------------------------
-- UNIT KERJA contoh
-- -------------------------------------------------------------
insert into public.units (code, name) values
  ('SETDA', 'Sekretariat Daerah'),
  ('DISKOMINFO', 'Dinas Komunikasi dan Informatika'),
  ('BPKAD', 'Badan Pengelolaan Keuangan dan Aset Daerah');

-- -------------------------------------------------------------
-- KATEGORI & JENIS BARANG (§5)
-- -------------------------------------------------------------
insert into public.asset_categories (code, name) values
  ('KENDARAAN', 'Kendaraan'),
  ('KOMPUTER_TI', 'Komputer dan Teknologi Informasi'),
  ('PERALATAN_KANTOR', 'Peralatan Kantor'),
  ('MEBEL', 'Mebel');

insert into public.asset_types (category_id, code, name)
select id, 'LAPTOP', 'Laptop' from public.asset_categories where code = 'KOMPUTER_TI'
union all
select id, 'PC', 'Personal Computer' from public.asset_categories where code = 'KOMPUTER_TI'
union all
select id, 'PRINTER', 'Printer' from public.asset_categories where code = 'KOMPUTER_TI'
union all
select id, 'MEJA', 'Meja' from public.asset_categories where code = 'MEBEL'
union all
select id, 'KURSI', 'Kursi' from public.asset_categories where code = 'MEBEL';

-- -------------------------------------------------------------
-- KATEGORI KENDARAAN (§5)
-- -------------------------------------------------------------
insert into public.vehicle_categories (code, name) values
  ('PERORANGAN', 'Kendaraan Bermotor Perorangan'),
  ('PENUMPANG', 'Kendaraan Bermotor Penumpang'),
  ('RODA_DUA', 'Kendaraan Bermotor Beroda Dua'),
  ('RODA_TIGA', 'Kendaraan Bermotor Roda Tiga'),
  ('OPERASIONAL', 'Kendaraan Bermotor Operasional'),
  ('LAPANGAN', 'Kendaraan Bermotor Lapangan'),
  ('LAINNYA', 'Kendaraan Lainnya');

-- -------------------------------------------------------------
-- JENIS PEMELIHARAAN (§7)
-- -------------------------------------------------------------
insert into public.maintenance_types (code, name) values
  ('RUTIN', 'Pemeliharaan Rutin'),
  ('BERKALA', 'Pemeliharaan Berkala'),
  ('PERBAIKAN', 'Perbaikan'),
  ('GANTI_SPAREPART', 'Penggantian Spare Part'),
  ('SERVIS', 'Servis'),
  ('GANTI_OLI', 'Penggantian Oli'),
  ('GANTI_BAN', 'Penggantian Ban'),
  ('AC', 'Perawatan AC'),
  ('MESIN', 'Perawatan Mesin'),
  ('BODY', 'Perawatan Body'),
  ('PAJAK', 'Pajak Kendaraan'),
  ('PERIZINAN', 'Perizinan'),
  ('KIR', 'KIR'),
  ('BBM', 'BBM'),
  ('KOMPUTER', 'Pemeliharaan Komputer'),
  ('PRINTER', 'Pemeliharaan Printer'),
  ('JARINGAN', 'Pemeliharaan Jaringan'),
  ('MEBEL', 'Pemeliharaan Mebel'),
  ('LAINNYA', 'Pemeliharaan Lainnya');

-- -------------------------------------------------------------
-- SUMBER DANA
-- -------------------------------------------------------------
insert into public.funding_sources (code, name) values
  ('APBD', 'Anggaran Pendapatan dan Belanja Daerah'),
  ('APBN', 'Anggaran Pendapatan dan Belanja Negara'),
  ('DAK', 'Dana Alokasi Khusus');

-- -------------------------------------------------------------
-- TAHUN ANGGARAN berjalan
-- -------------------------------------------------------------
insert into public.fiscal_years (year, is_active) values (2026, true);

-- -------------------------------------------------------------
-- PENYEDIA (vendor) contoh — data dummy, bukan penyedia sebenarnya
-- -------------------------------------------------------------
insert into public.vendors (code, name, phone) values
  ('VDR-001', 'CV Sinar Motor Jaya', '021-5550101'),
  ('VDR-002', 'CV Berkah Elektronik', '021-5550102'),
  ('VDR-003', 'CV Mebel Abadi', '021-5550103');

-- -------------------------------------------------------------
-- PROGRAM/KEGIATAN/SUB KEGIATAN contoh
-- -------------------------------------------------------------
insert into public.programs (code, name) values ('PRG-01', 'Program Penunjang Urusan Pemerintahan');

insert into public.activities (program_id, code, name)
select id, 'KEG-01', 'Administrasi Umum Perangkat Daerah' from public.programs where code = 'PRG-01';

insert into public.subactivities (activity_id, code, name)
select id, 'SUB-01', 'Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan, dan Pajak Kendaraan Dinas'
from public.activities where code = 'KEG-01';

-- -------------------------------------------------------------
-- REKENING BELANJA contoh
-- -------------------------------------------------------------
insert into public.budget_accounts (code, name) values
  ('5.1.02.02.01', 'Belanja Pemeliharaan Peralatan dan Mesin'),
  ('5.1.02.02.05', 'Belanja Pemeliharaan Kendaraan Dinas'),
  ('5.1.02.02.09', 'Belanja Pajak Kendaraan Bermotor');

-- -------------------------------------------------------------
-- THRESHOLD NOTIFIKASI default (§35) — nilai awal, dapat diubah admin
-- kapan saja lewat menu Pengaturan tanpa mengubah kode aplikasi.
-- -------------------------------------------------------------
insert into public.alert_settings (code, value_numeric, description) values
  ('TAX_DUE_REMINDER_DAYS', 30, 'Ingatkan H- sebelum pajak kendaraan jatuh tempo'),
  ('STNK_DUE_REMINDER_DAYS', 30, 'Ingatkan H- sebelum STNK jatuh tempo'),
  ('KIR_DUE_REMINDER_DAYS', 14, 'Ingatkan H- sebelum KIR jatuh tempo'),
  ('BUDGET_WARNING_PCT', 80, 'Persentase realisasi untuk notifikasi peringatan pagu'),
  ('BUDGET_CRITICAL_PCT', 90, 'Persentase realisasi untuk notifikasi kritis pagu');

-- -------------------------------------------------------------
-- CATATAN PENTING
-- -------------------------------------------------------------
-- User SUPER_ADMIN pertama TIDAK dibuat lewat seed SQL (karena harus terhubung
-- ke auth.users milik Supabase Auth). Langkah manual setelah migration:
--   1. Daftarkan 1 user lewat Supabase Auth (dashboard atau aplikasi, Phase 3).
--   2. Jalankan query berikut (ganti <USER_ID> dengan id dari auth.users):
--
--   insert into public.user_roles (user_id, role_id)
--   select '<USER_ID>', id from public.roles where code = 'SUPER_ADMIN';
