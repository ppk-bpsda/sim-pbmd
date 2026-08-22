import { createClient } from "@/lib/supabase/server";
import { getVehicleCategories, getUnits } from "@/repositories/masterDataRepository";
import { VehicleForm } from "../VehicleForm";

export default async function NewVehiclePage() {
  const supabase = createClient();
  const [categories, units] = await Promise.all([getVehicleCategories(supabase), getUnits(supabase)]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Tambah Kendaraan</h1>
        <p className="text-sm text-slate-500">Lengkapi data Noka/Nosin/Nopol beserta data aset kendaraan.</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <VehicleForm categories={categories} units={units} />
      </div>
    </div>
  );
}
