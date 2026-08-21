# Security — SIM-PBMD

> **Checklist awal.** Akan diperluas pada Phase 13 (Security Audit) dengan hasil review nyata.

## Prinsip
- RLS di database adalah lapisan otorisasi sesungguhnya, bukan hanya menyembunyikan tombol di UI.
- Service role key **tidak pernah** ada di kode frontend/browser — hanya di Edge Function server-side.
- `.env.local` tidak pernah di-commit (lihat `.gitignore`).
- Approval/verifikasi transaksi melalui database function `SECURITY DEFINER`, tervalidasi role.
- Audit log hanya bisa INSERT (via trigger sistem), tidak bisa UPDATE/DELETE oleh siapa pun lewat aplikasi.

## Checklist (diisi bertahap per fase)
- [ ] RLS aktif di seluruh tabel sensitif (Phase 2–3)
- [ ] Policy per role diuji dengan user dummy tiap role (Phase 3)
- [ ] Storage bucket private + policy berbasis unit kerja (Phase 11)
- [ ] Input validation server-side (Zod) di semua form transaksi (Phase 5–8)
- [ ] Pembatasan tipe & ukuran file upload (Phase 11)
- [ ] Review menyeluruh sebelum production deploy (Phase 13)
