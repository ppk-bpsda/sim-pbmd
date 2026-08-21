# Deployment — SIM-PBMD

## Lingkungan
| Lingkungan | Supabase Project | Vercel |
|---|---|---|
| Development | Project Supabase terpisah #1 | Preview deployment (per PR/branch) |
| Production | Project Supabase terpisah #2 | Production deployment (branch `main`) |

**Jangan pernah mencampur** database development dan production dalam satu project Supabase.

## Urutan Deploy
1. Migration Supabase (development) → uji lokal.
2. Merge ke `main` setelah review.
3. Migration Supabase (production) dijalankan **manual/terjadwal**, tidak otomatis dari CI, untuk
   mencegah perubahan skema tak terduga di data produksi.
4. Vercel build & deploy otomatis dari `main`.
5. Verifikasi acceptance criteria (lihat `SIM-PBMD_Blueprint_Fase0.md` §50 dari dokumen sumber)
   sebelum dinyatakan live.

## Backup & Recovery
> Akan didokumentasikan penuh pada Phase 15. Prinsip: repository GitHub **bukan** backup
> database — backup PostgreSQL (Supabase scheduled backup / `pg_dump`) dan backup Storage
> harus dikonfigurasi terpisah.
