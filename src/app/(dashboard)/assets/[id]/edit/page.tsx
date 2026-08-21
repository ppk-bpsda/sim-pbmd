import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssetById } from "@/repositories/assetRepository";
import { getAssetCategories, getAssetTypes, getUnits } from "@/repositories/masterDataRepository";
import { AssetForm } from "../../AssetForm";

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [asset, categories, types, units] = await Promise.all([
    getAssetById(supabase, params.id),
    getAssetCategories(supabase),
    getAssetTypes(supabase),
    getUnits(supabase),
  ]);

  if (!asset) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Edit Aset — {asset.name}</h1>
        <p className="text-sm text-slate-500">{asset.asset_code} — {asset.register_number}</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <AssetForm
          categories={categories}
          types={types}
          units={units}
          initialValues={{
            id: asset.id,
            asset_code: asset.asset_code,
            register_number: asset.register_number,
            name: asset.name,
            category_id: asset.category_id,
            type_id: asset.type_id,
            brand: asset.brand,
            model: asset.model,
            size_spec: asset.size_spec,
            material: asset.material,
            acquisition_year: asset.acquisition_year,
            condition: asset.condition,
            quantity: asset.quantity,
            unit_of_measure: asset.unit_of_measure,
            acquisition_value: asset.acquisition_value,
            book_value: asset.book_value,
            location: asset.location,
            holder_name: asset.holder_name,
            unit_id: asset.unit_id,
            notes: asset.notes,
          }}
        />
      </div>
    </div>
  );
}
