import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVehicleById } from "@/repositories/vehicleRepository";
import { getVehicleCategories, getUnits } from "@/repositories/masterDataRepository";
import { VehicleForm } from "../../VehicleForm";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [vehicle, categories, units] = await Promise.all([
    getVehicleById(supabase, params.id),
    getVehicleCategories(supabase),
    getUnits(supabase),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Edit Kendaraan — {vehicle.plate_number}</h1>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <VehicleForm
          categories={categories}
          units={units}
          initialValues={{
            id: vehicle.id,
            asset_code: vehicle.assets.asset_code,
            register_number: vehicle.assets.register_number,
            name: vehicle.assets.name,
            brand: vehicle.assets.brand,
            model: vehicle.assets.model,
            acquisition_year: vehicle.assets.acquisition_year,
            condition: vehicle.assets.condition,
            acquisition_value: vehicle.assets.acquisition_value,
            location: vehicle.assets.location,
            holder_name: vehicle.assets.holder_name,
            unit_id: vehicle.assets.unit_id,
            notes: vehicle.assets.notes,
            vehicle_category_id: vehicle.vehicle_category_id,
            plate_number: vehicle.plate_number,
            chassis_number: vehicle.chassis_number,
            engine_number: vehicle.engine_number,
            bpkb_number: vehicle.bpkb_number,
            stnk_number: vehicle.stnk_number,
            color: vehicle.color,
            status: vehicle.status,
          }}
        />
      </div>
    </div>
  );
}
