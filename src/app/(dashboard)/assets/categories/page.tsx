import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAssetCategories, getAssetTypes } from "@/repositories/masterDataRepository";
import { CategoryForm, TypeForm } from "./CategoryForms";

export default async function AssetCategoriesPage() {
  const supabase = createClient();
  const [categories, types] = await Promise.all([
    getAssetCategories(supabase),
    getAssetTypes(supabase),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/assets" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Master BMD
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Kelola Kategori & Jenis Barang</h1>
        <p className="text-sm text-slate-500">
          Kategori dan jenis barang baru dapat ditambahkan di sini tanpa mengubah kode aplikasi (§5).
          Hanya Admin/Super Admin yang dapat menambah data.
        </p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tambah Kategori</h2>
        <CategoryForm />
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tambah Jenis Barang</h2>
        <TypeForm categories={categories} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
          <h2 className="border-b border-surface-border px-4 py-3 text-sm font-semibold text-slate-700">
            Daftar Kategori ({categories.length})
          </h2>
          <ul className="divide-y divide-surface-border">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-700">{c.name}</span>
                <span className="text-xs text-slate-400">{c.code}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
          <h2 className="border-b border-surface-border px-4 py-3 text-sm font-semibold text-slate-700">
            Daftar Jenis Barang ({types.length})
          </h2>
          <ul className="divide-y divide-surface-border">
            {types.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-700">{t.name}</span>
                <span className="text-xs text-slate-400">{t.code}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
