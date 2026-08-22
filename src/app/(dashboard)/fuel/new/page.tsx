import { createClient } from "@/lib/supabase/server";
import { getVehicleById } from "@/repositories/vehicleRepository";
import { FuelForm } from "../FuelForm";

export default async function NewFuelPage({ searchParams }: { searchParams: { vehicle?: string } }) {
  let initialVehicle;

  if (searchParams.vehicle) {
    const supabase = createClient();
    const vehicle = await getVehicleById(supabase, searchParams.vehicle);
    if (vehicle) {
      initialVehicle = {
        id: vehicle.id,
        plate_number: vehicle.plate_number,
        name: vehicle.assets.name,
        unit_id: vehicle.assets.unit_id,
        unitName: vehicle.assets.units?.name,
      };
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Catat Transaksi BBM</h1>
        <p className="text-sm text-slate-500">Cari kendaraan, lalu lengkapi rincian pengisian bahan bakar.</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <FuelForm initialValues={initialVehicle ? { vehicle: initialVehicle } : undefined} />
      </div>
    </div>
  );
}
