/**
 * PLACEHOLDER SEMENTARA — file ini WAJIB digantikan otomatis oleh:
 *   npm run db:types
 * setelah project Supabase development tersambung, agar seluruh tipe
 * (nama tabel, kolom, enum) selalu sinkron 1:1 dengan schema migration di
 * supabase/migrations/ dan tidak pernah diketik manual.
 *
 * Sebelum digenerate, tipe di bawah ini SENGAJA dibuat permisif secara
 * struktural (bukan kosong) agar query .from("nama_tabel") tidak diblokir
 * TypeScript selama Phase 3–9 berjalan, TANPA mengorbankan pengecekan tipe
 * lain di sekitar pemanggilnya. Setelah `npm run db:types` dijalankan,
 * setiap .from("assets"), .select(...), dst. akan otomatis type-safe penuh
 * (kolom yang salah ketik akan gagal build) tanpa perlu ubah kode pemanggil.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PermissiveTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: any[];
};

export interface Database {
  public: {
    Tables: Record<string, PermissiveTable>;
    Views: Record<string, { Row: Record<string, any> }>;
    Functions: Record<string, { Args: Record<string, any>; Returns: any }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, any>>;
  };
}
