/**
 * PLACEHOLDER — file ini akan digantikan otomatis oleh:
 *   npm run db:types
 * setelah schema database (Phase 2) dibuat di Supabase, sehingga seluruh tipe
 * (tabel, kolom, enum) selalu sinkron dengan database sesungguhnya dan tidak
 * pernah diketik manual (menghindari ketidaksesuaian tipe vs skema nyata).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Database {
  // Akan diisi otomatis oleh Supabase CLI (public: { Tables: {...} })
}
