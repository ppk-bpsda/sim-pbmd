"use client";

import { createBrowserClient } from "@supabase/ssr";
// NOTE: generic <Database> SENGAJA belum dipasang di sini. Placeholder tipe
// permisif di src/types/database.ts justru membuat TypeScript meng-infer
// 'never' pada beberapa hasil query (.update(), .select() kolom tertentu),
// bukan 'any' seperti yang diharapkan — jadi untuk sementara client dibiarkan
// tanpa generic (query bertipe permisif penuh). Setelah `npm run db:types`
// menghasilkan tipe Database ASLI dari schema Supabase (bukan placeholder),
// pasang kembali sebagai createBrowserClient<Database>(...) agar seluruh
// query di aplikasi otomatis type-safe penuh.

/**
 * Supabase client untuk digunakan di dalam Client Component.
 * Hanya memakai NEXT_PUBLIC_* env (anon key) — TIDAK PERNAH memuat service role key.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi di .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}
