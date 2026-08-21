# Database — SIM-PBMD

Schema di bawah ini sudah **diuji end-to-end** di PostgreSQL 16 lokal (seluruh migration
`0001`–`0009` dijalankan berurutan tanpa error, ditambah skenario fungsional: nomor transaksi
otomatis, workflow status, realisasi anggaran otomatis, audit log, dan isolasi RLS antar unit
kerja). Lihat catatan pengujian di akhir dokumen ini.

## Daftar Migration
| File | Isi |
|---|---|
| `0001_extensions_and_helpers.sql` | Ekstensi (`pgcrypto`, `pg_trgm`), fungsi `set_updated_at()` |
| `0002_units_rbac_profiles.sql` | `units`, `roles`, `permissions`, `role_permissions`, `profiles`, `user_roles`, trigger auto-create profile |
| `0003_master_data.sql` | `asset_categories`, `asset_types`, `vehicle_categories`, `maintenance_types`, `vendors`, `funding_sources`, `fiscal_years`, `programs`, `activities`, `subactivities`, `budget_accounts` |
| `0004_assets_vehicles.sql` | `assets` (KIB B), `vehicles`, `vehicle_documents` |
| `0005_budgets.sql` | `budgets` (pagu), `budget_realizations` (derived, read-only) |
| `0006_transactions.sql` | `maintenance_transactions`, `maintenance_details`, `status_history`, `fuel_transactions` |
| `0007_support_tables.sql` | `attachments`, `notifications`, `import_batches`, `import_errors`, `audit_logs` |
| `0008_functions_and_triggers.sql` | Fungsi helper RLS (`has_role`, `user_unit_ids`, `can_access_unit`), trigger audit generik, generator nomor transaksi, pencatat riwayat status, penghitung realisasi anggaran otomatis |
| `0009_rls_policies.sql` | GRANT dasar + RLS policy seluruh tabel |

## ERD Ringkas
```
units ──< profiles >── user_roles >── roles ── role_permissions >── permissions

asset_categories ─< asset_types
asset_categories ─< assets >─ units
                       │
                       ├─ vehicles (1:1, PK bersama) ─< vehicle_documents
                       │
maintenance_types ─< maintenance_transactions >─ assets
                              │        │    │
                              │        │    ├─ vendors, funding_sources
                              │        │    ├─ programs → activities → subactivities
                              │        │    └─ budget_accounts, fiscal_years, units
                              │        └─< maintenance_details
                              └─< status_history

vehicles ─< fuel_transactions ─ units

fiscal_years + budget_accounts + units ─< budgets (pagu)
fiscal_years + budget_accounts + units ─< budget_realizations (DERIVED — hanya trigger yang menulis)

(table_name, record_id) ←── attachments (polymorphic, mis. dari maintenance_transactions/vehicle_documents)
audit_logs, import_batches ─< import_errors, notifications
```

## Mekanisme Kunci

### 1. Nomor Transaksi Otomatis
Format: `PML/{tahun}/{urutan 4 digit}/{kode unit}`, mis. `PML/2026/0001/DISKOMINFO`.
Diisi oleh trigger `fn_generate_transaction_number` (BEFORE INSERT), **bukan** dibuat di
aplikasi — mencegah nomor bentrok/duplikat meski banyak pengguna input bersamaan.

### 2. Workflow Status & Riwayat
`DRAFT → SUBMITTED → VERIFIED → APPROVED → POSTED`, dengan `REJECTED`/`CANCELLED`. Setiap
perubahan `status` otomatis dicatat ke `status_history` oleh trigger
`fn_track_status_history`. Transaksi `REJECTED` **wajib** memiliki `rejection_reason` —
ditegakkan oleh `CHECK` constraint `chk_rejection_reason`, sehingga tidak mungkin lolos meski
lewat import atau bug di frontend.

### 3. Realisasi Anggaran — Selalu Sinkron dengan Transaksi
`budget_realizations` **tidak pernah diinput manual**. Trigger `fn_recalculate_budget_realization`
menghitung ulang `SUM(amount)` dari `maintenance_transactions` berstatus `APPROVED`/`POSTED`
setiap kali ada INSERT/UPDATE/DELETE, lalu `UPSERT` ke `budget_realizations`. Sudah diuji:
realisasi tetap `0` selama status masih `VERIFIED`, dan langsung terisi begitu status menjadi
`APPROVED` — sesuai aturan §11 (transaksi draft tidak dihitung sebagai realisasi).

### 4. Audit Trail Otomatis
Trigger `fn_audit_log` (SECURITY DEFINER) terpasang di tabel sensitif (`assets`, `vehicles`,
`maintenance_transactions`, `fuel_transactions`, `budgets`, `user_roles`) dan mencatat setiap
CREATE/UPDATE/DELETE ke `audit_logs` beserta data sebelum/sesudah (JSONB) — berjalan di level
database sehingga **tidak bisa dilewati** dari API meski ada bug di frontend.

### 5. Row Level Security — Diuji Nyata, Bukan Asumsi
RLS diuji dengan skenario: user ber-role OPERATOR di unit DISKOMINFO **hanya melihat** aset
milik DISKOMINFO (aset unit SETDA tidak muncul di SELECT), dan **percobaan INSERT** aset ke
unit SETDA oleh user tsb **ditolak oleh database** (`new row violates row-level security
policy`) — bukan hanya disembunyikan di UI. Pola ini konsisten di seluruh tabel transaksional
lewat fungsi helper `has_role()`, `user_unit_ids()`, dan `can_access_unit()`.

Catatan implementasi: RLS butuh **GRANT tabel** terlebih dahulu (`grant select, insert,
update, delete on all tables in schema public to authenticated`) sebelum policy berlaku —
sudah termasuk di awal `0009_rls_policies.sql` agar schema ini portable dan tidak bergantung
pada konfigurasi default platform tertentu.

## Cara Menjalankan Migration

### Development (Supabase CLI, opsional untuk kerja lokal)
```bash
supabase link --project-ref <project-id-development>
supabase db push
```

### Atau lewat SQL Editor di Supabase Dashboard
Jalankan file di `supabase/migrations/` **satu per satu, berurutan sesuai nomor** (0001 → 0009),
lalu `supabase/seed/0001_seed_dev.sql` (development only).

### Setelah migration + seed, buat user SUPER_ADMIN pertama
1. Daftarkan 1 akun lewat Supabase Auth (dashboard, atau nanti lewat form Phase 3).
2. Jalankan (ganti `<USER_ID>` dengan id dari `auth.users`):
```sql
insert into public.user_roles (user_id, role_id)
select '<USER_ID>', id from public.roles where code = 'SUPER_ADMIN';
```

## Regenerasi Tipe TypeScript
Setelah migration diterapkan ke project Supabase sungguhan:
```bash
npm run db:types
```
Ini akan menimpa `src/types/database.ts` (placeholder) dengan tipe yang sinkron 1:1 dengan
schema di atas.

## Catatan Pengujian Lokal
Divalidasi dengan PostgreSQL 16 + stub schema `auth` (meniru `auth.users`, `auth.uid()`) dan
stub role `authenticated`/`anon`/`service_role` ala Supabase. Hasil:
- ✅ 9 file migration berjalan bersih tanpa error dari database kosong.
- ✅ Nomor transaksi otomatis, riwayat status, audit log, dan realisasi anggaran otomatis
  bekerja sesuai spesifikasi.
- ✅ Constraint `chk_rejection_reason` menolak transaksi `REJECTED` tanpa alasan.
- ✅ RLS mengisolasi data antar unit kerja dan menolak insert lintas-unit oleh OPERATOR.

Pengujian ini tidak menggantikan Security Audit penuh di Phase 13 (yang akan mencakup seluruh
role — VERIFIKATOR, PIMPINAN, AUDITOR — dan seluruh tabel), namun memastikan fondasi Phase 2
solid sebelum Phase 3 (Autentikasi) dibangun di atasnya.
