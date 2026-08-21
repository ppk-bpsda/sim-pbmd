/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PLACEHOLDER SEMENTARA — file ini WAJIB digantikan otomatis oleh:
 *   npm run db:types
 * setelah project Supabase development tersambung, agar seluruh tipe
 * (nama tabel, kolom, enum) selalu sinkron 1:1 dengan schema migration di
 * supabase/migrations/ dan tidak pernah diketik manual.
 *
 * Sebelum digenerate, tipe di bawah ini SENGAJA dibuat permisif secara
 * struktural (bukan kosong) dengan `any` di beberapa tempat — karena itu
 * `no-explicit-any` dimatikan khusus untuk file ini (bukan project-wide).
 * File ini SAAT INI belum dipakai oleh lib/supabase/client.ts atau server.ts
 * (lihat catatan di kedua file tsb.) — baru dipasang kembali sebagai generic
 * SupabaseClient<Database> setelah tipe asli digenerate.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
