import { createClient } from "@/lib/supabase/server";
import { getAssetCategories, getAssetTypes, getUnits } from "@/repositories/masterDataRepository";
import { AssetForm } from "../AssetForm";

export default async function NewAssetPage() {
  const supabase = createClient();
  const [categories, types, units] = await Promise.all([
    getAssetCategories(supabase),
    getAssetTypes(supabase),
    getUnits(supabase),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Tambah Aset Baru</h1>
        <p className="text-sm text-slate-500">Lengkapi data sesuai Kartu Inventaris Barang (KIB B).</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <AssetForm categories={categories} types={types} units={units} />
      </div>
    </div>
  );
}
