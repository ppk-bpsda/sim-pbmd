"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fuelTransactionSchema } from "@/validations/fuel";

export type FuelActionState = { error: string | null };

export async function saveFuelAction(
  _prevState: FuelActionState,
  formData: FormData
): Promise<FuelActionState> {
  const id = formData.get("id")?.toString() || undefined;

  const parsed = fuelTransactionSchema.safeParse({
    transaction_date: formData.get("transaction_date"),
    vehicle_id: formData.get("vehicle_id"),
    fuel_type: formData.get("fuel_type"),
    volume_liters: formData.get("volume_liters"),
    price_per_liter: formData.get("price_per_liter"),
    odometer_km: formData.get("odometer_km"),
    provider_name: formData.get("provider_name"),
    proof_number: formData.get("proof_number"),
    unit_id: formData.get("unit_id"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;

  const supabase = createClient();

  const payload = {
    transaction_date: d.transaction_date,
    vehicle_id: d.vehicle_id,
    fuel_type: d.fuel_type,
    volume_liters: d.volume_liters,
    price_per_liter: d.price_per_liter,
    odometer_km: d.odometer_km,
    provider_name: d.provider_name || null,
    proof_number: d.proof_number || null,
    unit_id: d.unit_id,
    notes: d.notes || null,
  };

  let fuelId = id;

  if (id) {
    const { error } = await supabase.from("fuel_transactions").update(payload).eq("id", id);
    if (error) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
  } else {
    const { data, error } = await supabase.from("fuel_transactions").insert(payload).select("id").single();
    if (error || !data) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
    fuelId = data.id;
  }

  revalidatePath("/fuel");
  revalidatePath(`/vehicles/${d.vehicle_id}`);
  redirect(`/fuel/${fuelId}/edit`);
}

export async function deleteFuelAction(id: string, vehicleId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("fuel_transactions").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/fuel");
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect("/fuel");
}
