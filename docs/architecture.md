# Arsitektur SIM-PBMD

> Dokumen ini merangkum arsitektur teknis. Untuk analisis kebutuhan, ERD lengkap, dan
> rancangan RLS, lihat dokumen `SIM-PBMD_Blueprint_Fase0.md` yang diberikan sebelum project
> ini dibuat — dokumen ini adalah turunan teknisnya untuk dipakai developer sehari-hari.

## Diagram Arsitektur
```
Pengguna (Browser)
      │ HTTPS
Frontend — Next.js (Vercel)
  UI Layer / Validation (Zod) / Hooks / Services
      │ Supabase JS SDK
Supabase Platform
  Auth (JWT + roles) | PostgreSQL + RLS + Functions/Triggers | Storage
      │
Audit Logging (trigger-based, tidak bisa dilewati dari API)
```

## Pemisahan Layer
| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| UI | `src/components/`, `src/app/**` | Tampilan, tidak ada query langsung ke Supabase |
| Business logic | `src/services/` | Aturan bisnis (mis. hitung realisasi, validasi workflow status) |
| Data access | `src/repositories/` | Query Supabase murni, tanpa logic bisnis |
| Validasi | `src/validations/` | Zod schema, dipakai di client & server action |
| Auth/Authorization | `src/lib/supabase/*`, `middleware.ts`, + RLS di database | Dua lapis: kenyamanan UX di app, penegakan sesungguhnya di DB |
| Modul domain | `src/modules/<nama-modul>/` | Komponen & hook spesifik satu modul (assets, maintenance, dst.) |

## Roadmap Pengembangan
| Fase | Fokus | Status |
|---|---|---|
| 1 | Project Foundation | **Selesai (dokumen ini)** |
| 2 | Database (schema, migration, RLS) | Belum |
| 3 | Autentikasi (login, role, RLS dasar) | Belum |
| 4 | Master BMD (KIB B, kategori, aset) | Belum |
| 5 | Pemeliharaan (transaksi + workflow) | Belum |
| 6 | Kendaraan (pajak/STNK/KIR) + BBM | Belum |
| 7 | Anggaran (pagu, realisasi otomatis) | Belum |
| 8 | Import Engine (Excel/CSV) | Belum |
| 9 | Laporan (unduh/cetak) | Belum |
| 10 | Dashboard (Operator/Verifikator/Pimpinan) | Belum |
| 11 | Dokumen (lampiran, akses terkontrol) | Belum |
| 12 | Audit Trail | Belum |
| 13 | Security Audit | Belum |
| 14 | Performance Optimization | Belum |
| 15 | Production Deployment | Belum |

## Konvensi Kode
- Semua komponen interaktif memakai `"use client"` secara eksplisit; Server Component adalah default.
- Query data besar (tabel transaksi) **wajib** server-side pagination — lihat §40/§41 Blueprint.
- Tidak ada logic bisnis di dalam file `page.tsx` — hanya komposisi UI + pemanggilan `services/`.
- Setiap tabel transaksional baru wajib melalui migration di `supabase/migrations/`, tidak ada perubahan manual di dashboard Supabase produksi.
