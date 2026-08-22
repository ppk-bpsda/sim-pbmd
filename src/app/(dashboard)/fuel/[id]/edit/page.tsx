import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFuelTransactionById } from "@/repositories/fuelRepository";
import { deleteFuelAction } from "../../actions";
import { FuelForm } from "../../FuelForm";

export default async function EditFuelPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const fuel = await getFuelTransactionById(supabase, params.id);

  if (!fuel) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Edit Transaksi BBM</h1>
          <p className="text-sm text-slate-500">{fuel.vehicles?.plate_number} — {fuel.vehicles?.assets?.name}</p>
        </div>
        <form action={deleteFuelAction.bind(null, fuel.id, fuel.vehicle_id)}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md border border-status-danger/30 px-4 py-2 text-sm text-status-danger hover:bg-status-dangerBg"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </form>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <FuelForm
          initialValues={{
            id: fuel.id,
            transaction_date: fuel.transaction_date,
            vehicle: fuel.vehicles
              ? {
                  id: fuel.vehicles.id,
                  plate_number: fuel.vehicles.plate_number,
                  name: fuel.vehicles.assets?.name ?? "",
                  unit_id: fuel.vehicles.assets?.unit_id ?? "",
                  unitName: fuel.vehicles.assets?.units?.name,
                }
              : undefined,
            fuel_type: fuel.fuel_type,
            volume_liters: fuel.volume_liters,
            price_per_liter: fuel.price_per_liter,
            odometer_km: fuel.odometer_km,
            provider_name: fuel.provider_name,
            proof_number: fuel.proof_number,
            notes: fuel.notes,
          }}
        />
      </div>
    </div>
  );
}
