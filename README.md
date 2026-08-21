# SIM-PBMD
### Sistem Informasi Pemeliharaan Barang Milik Daerah

Aplikasi pencatatan, pengendalian, monitoring, rekapitulasi, analisis, dan pendokumentasian
kegiatan pemeliharaan Barang Milik Daerah (BMD) — mencakup pemeliharaan peralatan/mesin,
kendaraan dinas, komputer, mebel, anggaran pemeliharaan, hingga laporan realisasi.

> **Status: Phase 1–3 selesai.** Project foundation, database schema lengkap (migration
> 0001–0010 + RLS), dan autentikasi (login/logout/profil, role-aware navigation) sudah
> aktif dan terhubung Supabase sungguhan. Modul transaksi (Master BMD, Pemeliharaan,
> Kendaraan, dst.) masih placeholder — menyusul Phase 4 dst. Identitas warna aplikasi:
> **Maroon** (bukan biru/hijau), lihat token warna di `tailwind.config.ts`.

---

## Tujuan
Mengubah data inventaris BMD menjadi sistem informasi manajemen pemeliharaan yang akurat,
tertelusur (traceable), teraudit, dan aman — bukan sekadar aplikasi input data.

## Teknologi
| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Data fetching/state | TanStack Query, TanStack Table |
| Validasi | Zod + React Hook Form |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Grafik | Recharts |
| Export | ExcelJS, PapaParse |
| Hosting | Vercel |

## Fitur (Roadmap Ringkas)
Lihat `docs/architecture.md` untuk roadmap Phase 1–15 secara lengkap. Modul utama:
Master BMD, Pemeliharaan, Kendaraan, BBM, Anggaran, Import Data, Laporan, Dashboard,
Audit Trail.

---

## Instalasi

### Prasyarat
- Node.js 20 LTS atau lebih baru
- npm 10+
- Akun [Supabase](https://supabase.com) (project development)
- Akun [Vercel](https://vercel.com) (untuk deployment)
- Supabase CLI (opsional, untuk migration lokal): `npm install -g supabase`

### Langkah
```bash
git clone <url-repository>
cd sim-pbmd
npm install
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial Supabase project Anda (lihat bagian **Konfigurasi
Environment** di bawah).

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## Konfigurasi Environment

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | URL project Supabase (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Anon/public key — aman diekspos ke browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya untuk Edge Function | **JANGAN PERNAH** diberi prefix `NEXT_PUBLIC_` atau diimpor dari kode client |
| `SUPABASE_PROJECT_ID` | Opsional | Dipakai skrip `npm run db:types` |

`.env.local` **tidak pernah** di-commit (lihat `.gitignore`). Untuk Vercel, isi variabel yang
sama melalui **Project Settings → Environment Variables**, bukan lewat file di repository.

---

## Supabase Setup (ringkas — detail penuh menyusul di Phase 2 & 3)
1. Buat project baru di Supabase untuk **development** (dan project terpisah untuk **production**).
2. Salin `Project URL` dan `anon public key` ke `.env.local`.
3. Migration schema database akan ditambahkan di `supabase/migrations/` pada Phase 2.
4. Seed data (kategori, jenis pemeliharaan, role, dsb.) akan ditambahkan di `supabase/seed/`.

## Deployment ke Vercel (ringkas)
1. Hubungkan repository GitHub ke project Vercel.
2. Isi environment variables yang sama seperti `.env.local` di **Project Settings → Environment
   Variables** (pisahkan value untuk Preview dan Production bila project Supabase juga terpisah).
3. Vercel akan build otomatis (`next build`) setiap push ke `main` (production) atau PR
   (preview deployment).
4. Verifikasi hasil deploy sebelum dianggap production-ready.

## Troubleshooting
| Gejala | Kemungkinan Penyebab |
|---|---|
| Error "Konfigurasi Supabase belum lengkap" | `.env.local` belum diisi atau server dev belum di-restart setelah mengubah env |
| Redirect loop antara `/login` dan `/dashboard` | Session Supabase belum tersinkron — periksa cookie & `middleware.ts` |
| Style Tailwind tidak muncul | Jalankan ulang `npm run dev` setelah instalasi pertama agar Tailwind JIT membaca ulang `content` di `tailwind.config.ts` |

---

## Struktur Project
Lihat `docs/architecture.md` untuk detail lengkap struktur folder, arsitektur layer, dan ERD.

## Lisensi & Kerahasiaan
Aplikasi internal instansi pemerintah. Tidak untuk didistribusikan publik tanpa izin.
