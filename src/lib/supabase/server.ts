import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Supabase client untuk digunakan di Server Component, Server Action, dan Route Handler.
 * Tetap memakai anon key (RLS yang menentukan hak akses berdasarkan sesi user login),
 * BUKAN service role key. Service role key hanya boleh dipakai di Edge Function tepercaya
 * (mis. import engine) dan tidak pernah diekspos ke bundel frontend.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi di .env.local"
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Dipanggil dari Server Component (bukan Server Action/Route Handler) — aman diabaikan
          // karena middleware yang akan menangani refresh session.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Lihat catatan di atas.
        }
      },
    },
  });
}
