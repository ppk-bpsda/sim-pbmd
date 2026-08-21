-- =============================================================
-- 0007_support_tables.sql
-- Lampiran (metadata Storage), notifikasi, import engine, audit log.
-- =============================================================

-- -------------------------------------------------------------
-- ATTACHMENTS — hanya metadata + path Supabase Storage (§15).
-- Referensi polymorphic: table_name + record_id, agar 1 tabel lampiran
-- bisa dipakai untuk maintenance_transactions, vehicle_documents, assets, dst.
-- -------------------------------------------------------------
create table public.attachments (
  id              uuid primary key default gen_random_uuid(),
  table_name      text not null,          -- mis. 'maintenance_transactions'
  record_id       uuid not null,
  unit_id         uuid not null references public.units(id) on delete restrict,
  category        text not null default 'LAINNYA'
                    check (category in
                      ('NOTA','INVOICE','KUITANSI','SPK','SURAT_PESANAN','BUKTI_BAYAR',
                       'FOTO_SEBELUM','FOTO_SESUDAH','DOKUMEN_KENDARAAN','DOKUMEN_PAJAK','LAINNYA')),
  file_path       text not null,          -- path di Supabase Storage bucket
  file_name       text not null,
  file_type       text,                    -- MIME type
  file_size_bytes bigint check (file_size_bytes >= 0),
  uploaded_by     uuid references public.profiles(id),
  uploaded_at     timestamptz not null default now()
);

create index idx_attachments_record on public.attachments(table_name, record_id);
create index idx_attachments_unit on public.attachments(unit_id);

comment on table public.attachments is
  'Metadata lampiran. File biner disimpan di Supabase Storage, bukan di database (§15).';

-- -------------------------------------------------------------
-- NOTIFICATIONS — §35 Alert System
-- -------------------------------------------------------------
create table public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  type           text not null
                   check (type in
                     ('PAJAK_JATUH_TEMPO','STNK_JATUH_TEMPO','KIR_JATUH_TEMPO',
                      'TRANSAKSI_BELUM_VERIFIKASI','TRANSAKSI_DITOLAK',
                      'PAGU_HAMPIR_HABIS','REALISASI_MELEBIHI_THRESHOLD',
                      'IMPORT_GAGAL','DOKUMEN_BELUM_LENGKAP')),
  title          text not null,
  message        text not null,
  related_table  text,
  related_id     uuid,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, is_read);

-- -------------------------------------------------------------
-- IMPORT_BATCHES & IMPORT_ERRORS — §16/§17 (upload → validasi → preview
-- → error report → konfirmasi → import → audit log)
-- -------------------------------------------------------------
create table public.import_batches (
  id             uuid primary key default gen_random_uuid(),
  import_type    text not null check (import_type in ('KIB_B','MAINTENANCE_TRANSACTION')),
  file_name      text not null,
  status         text not null default 'UPLOADED'
                   check (status in
                     ('UPLOADED','VALIDATED','PREVIEWED','CONFIRMED','IMPORTED','FAILED','CANCELLED')),
  total_rows     integer not null default 0,
  success_rows   integer not null default 0,
  error_rows     integer not null default 0,
  unit_id        uuid references public.units(id),
  uploaded_by    uuid references public.profiles(id),
  uploaded_at    timestamptz not null default now(),
  processed_at   timestamptz
);

create index idx_import_batches_unit on public.import_batches(unit_id);
create index idx_import_batches_status on public.import_batches(status);

create table public.import_errors (
  id             uuid primary key default gen_random_uuid(),
  batch_id       uuid not null references public.import_batches(id) on delete cascade,
  row_number     integer not null,
  column_name    text,
  error_message  text not null,
  raw_data       jsonb
);

create index idx_import_errors_batch on public.import_errors(batch_id);

-- -------------------------------------------------------------
-- AUDIT_LOGS — §22. Tidak bisa diedit/dihapus lewat aplikasi (lihat RLS 0009);
-- hanya diisi lewat trigger (SECURITY DEFINER, lihat 0008) atau server action tepercaya.
-- -------------------------------------------------------------
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  table_name   text not null,
  record_id    uuid,
  action       text not null
                 check (action in
                   ('CREATE','UPDATE','DELETE','IMPORT','EXPORT',
                    'LOGIN','LOGOUT','APPROVE','REJECT','VERIFY')),
  old_data     jsonb,
  new_data     jsonb,
  changed_by   uuid references public.profiles(id),
  reason       text,
  ip_address   inet,
  user_agent   text,
  changed_at   timestamptz not null default now()
);

create index idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index idx_audit_logs_changed_by on public.audit_logs(changed_by);
create index idx_audit_logs_changed_at on public.audit_logs(changed_at);

comment on table public.audit_logs is
  'Data audit tidak boleh mudah dihapus/diubah oleh operator biasa (§22) — ditegakkan via RLS di 0009.';
