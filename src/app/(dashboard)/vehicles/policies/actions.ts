"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vehicleBudgetPolicySchema, bulkVehicleBudgetPolicySchema } from "@/validations/vehicle";

export type PolicyActionState = { error: string | null; success?: string | null };

/**
 * Set alokasi anggaran untuk SATU kendaraan pada satu tahun anggaran.
 * Upsert (vehicle_id, fiscal_year_id) — mengubah kebijakan tahun berjalan
 * tidak menimpa tahun lain, konsisten dengan §12 (periode laporan).
 */
export async function saveVehicleBudgetPolicyAction(
  vehicleId: string,
  _prevState: PolicyActionState,
  formData: FormData
): Promise<PolicyActionState> {
  const parsed = vehicleBudgetPolicySchema.safeParse({
    fiscal_year_id: formData.get("fiscal_year_id"),
    monthly_fuel_allocation: formData.get("monthly_fuel_allocation"),
    annual_maintenance_allocation: formData.get("annual_maintenance_allocation"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("vehicle_budget_policies").upsert(
    {
      vehicle_id: vehicleId,
      fiscal_year_id: parsed.data.fiscal_year_id,
      monthly_fuel_allocation: parsed.data.monthly_fuel_allocation,
      annual_maintenance_allocation: parsed.data.annual_maintenance_allocation,
      notes: parsed.data.notes || null,
    },
    { onConflict: "vehicle_id,fiscal_year_id" }
  );

  if (error) {
    return { error: "Alokasi anggaran tidak dapat disimpan. Pastikan Anda memiliki hak akses (Admin)." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles/rekap");
  return { error: null, success: "Alokasi anggaran berhasil disimpan." };
}

/**
 * Terapkan satu nilai alokasi ke SEMUA kendaraan dalam satu kategori
 * sekaligus (mis. seluruh motor dinas: Rp200.000/bulan BBM + Rp1.050.000/
 * tahun pemeliharaan). Dipakai untuk kebijakan yang berlaku seragam per
 * kategori, tanpa perlu mengulang input satu-satu.
 */
export async function bulkApplyVehicleBudgetPolicyAction(
  _prevState: PolicyActionState,
  formData: FormData
): Promise<PolicyActionState> {
  const parsed = bulkVehicleBudgetPolicySchema.safeParse({
    vehicle_category_id: formData.get("vehicle_category_id"),
    fiscal_year_id: formData.get("fiscal_year_id"),
    monthly_fuel_allocation: formData.get("monthly_fuel_allocation"),
    annual_maintenance_allocation: formData.get("annual_maintenance_allocation"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();

  const { data: vehicles, error: fetchError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("vehicle_category_id", parsed.data.vehicle_category_id);

  if (fetchError) {
    return { error: "Gagal mengambil daftar kendaraan pada kategori ini." };
  }
  if (!vehicles || vehicles.length === 0) {
    return { error: "Tidak ada kendaraan pada kategori yang dipilih." };
  }

  const rows = vehicles.map((v: { id: string }) => ({
    vehicle_id: v.id,
    fiscal_year_id: parsed.data.fiscal_year_id,
    monthly_fuel_allocation: parsed.data.monthly_fuel_allocation,
    annual_maintenance_allocation: parsed.data.annual_maintenance_allocation,
    notes: parsed.data.notes || null,
  }));

  const { error } = await supabase
    .from("vehicle_budget_policies")
    .upsert(rows, { onConflict: "vehicle_id,fiscal_year_id" });

  if (error) {
    return { error: "Alokasi anggaran tidak dapat diterapkan. Pastikan Anda memiliki hak akses (Admin)." };
  }

  revalidatePath("/vehicles/rekap");
  return { error: null, success: `Alokasi anggaran diterapkan ke ${rows.length} kendaraan.` };
}
