"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vehicleSchema, vehicleDocumentSchema } from "@/validations/vehicle";
import { isAssetCodeRegisterDuplicate } from "@/repositories/assetRepository";
import { isPlateNumberDuplicate } from "@/repositories/vehicleRepository";
import { getVehicleAssetCategoryId } from "@/repositories/masterDataRepository";

export type VehicleActionState = { error: string | null };

export async function saveVehicleAction(
  _prevState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const id = formData.get("id")?.toString() || undefined;

  const raw = {
    asset_code: formData.get("asset_code"),
    register_number: formData.get("register_number"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    acquisition_year: formData.get("acquisition_year"),
    condition: formData.get("condition"),
    acquisition_value: formData.get("acquisition_value"),
    location: formData.get("location"),
    holder_name: formData.get("holder_name"),
    unit_id: formData.get("unit_id"),
    notes: formData.get("notes"),
    vehicle_category_id: formData.get("vehicle_category_id"),
    plate_number: formData.get("plate_number"),
    chassis_number: formData.get("chassis_number"),
    engine_number: formData.get("engine_number"),
    bpkb_number: formData.get("bpkb_number"),
    stnk_number: formData.get("stnk_number"),
    color: formData.get("color"),
    status: formData.get("status"),
  };

  const parsed = vehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;

  const supabase = createClient();

  const [duplicateAssetCode, duplicatePlate] = await Promise.all([
    isAssetCodeRegisterDuplicate(supabase, d.asset_code, d.register_number, id),
    isPlateNumberDuplicate(supabase, d.plate_number, id),
  ]);
  if (duplicateAssetCode) {
    return { error: `Kombinasi Kode Barang "${d.asset_code}" + Nomor Register "${d.register_number}" sudah terdaftar.` };
  }
  if (duplicatePlate) {
    return { error: `Nomor polisi "${d.plate_number}" sudah terdaftar pada kendaraan lain.` };
  }

  const assetPayload = {
    asset_code: d.asset_code,
    register_number: d.register_number,
    name: d.name,
    brand: d.brand || null,
    model: d.model || null,
    acquisition_year: d.acquisition_year,
    condition: d.condition,
    quantity: 1,
    unit_of_measure: "Unit",
    acquisition_value: d.acquisition_value,
    location: d.location || null,
    holder_name: d.holder_name || null,
    unit_id: d.unit_id,
    notes: d.notes || null,
  };

  const vehiclePayload = {
    vehicle_category_id: d.vehicle_category_id,
    plate_number: d.plate_number,
    chassis_number: d.chassis_number || null,
    engine_number: d.engine_number || null,
    bpkb_number: d.bpkb_number || null,
    stnk_number: d.stnk_number || null,
    color: d.color || null,
    status: d.status,
  };

  let vehicleId = id;

  if (id) {
    // UPDATE: assets dan vehicles diperbarui terpisah (dua tabel, satu id yang sama).
    const { error: assetError } = await supabase.from("assets").update(assetPayload).eq("id", id);
    if (assetError) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
    const { error: vehicleError } = await supabase.from("vehicles").update(vehiclePayload).eq("id", id);
    if (vehicleError) {
      return { error: "Data kendaraan tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
  } else {
    // CREATE: kategori aset 'Kendaraan' dicari by kode (bukan hardcode UUID).
    const vehicleCategoryAssetId = await getVehicleAssetCategoryId(supabase);
    if (!vehicleCategoryAssetId) {
      return {
        error: "Kategori aset 'Kendaraan' belum tersedia di Master Kategori. Hubungi administrator.",
      };
    }

    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .insert({ ...assetPayload, category_id: vehicleCategoryAssetId })
      .select("id")
      .single();

    if (assetError || !asset) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }

    const { error: vehicleError } = await supabase
      .from("vehicles")
      .insert({ id: asset.id, ...vehiclePayload });

    if (vehicleError) {
      // Rollback manual: batalkan asset yang sudah terlanjur dibuat agar
      // tidak ada "aset yatim" berkategori Kendaraan tanpa data kendaraan.
      await supabase.from("assets").delete().eq("id", asset.id);
      return { error: "Data kendaraan tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }

    vehicleId = asset.id;
  }

  revalidatePath("/vehicles");
  if (vehicleId) revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

/**
 * Nonaktifkan kendaraan (soft delete, §32) — status kendaraan jadi DIHAPUS
 * dan aset terkait ditandai deleted_at, riwayat pemeliharaan/BBM tetap utuh.
 */
export async function retireVehicleAction(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("vehicles").update({ status: "DIHAPUS" }).eq("id", id);
  await supabase.from("assets").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

// =============================================================
// Dokumen kendaraan (STNK/Pajak/KIR/BPKB)
// =============================================================

export type DocumentActionState = { error: string | null };

export async function addVehicleDocumentAction(
  vehicleId: string,
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const parsed = vehicleDocumentSchema.safeParse({
    document_type: formData.get("document_type"),
    document_number: formData.get("document_number"),
    issued_date: formData.get("issued_date"),
    expiry_date: formData.get("expiry_date"),
    reminder_days_before: formData.get("reminder_days_before"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("vehicle_documents").insert({
    vehicle_id: vehicleId,
    document_type: parsed.data.document_type,
    document_number: parsed.data.document_number || null,
    issued_date: parsed.data.issued_date || null,
    expiry_date: parsed.data.expiry_date || null,
    reminder_days_before: parsed.data.reminder_days_before,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "Dokumen tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  return { error: null };
}

export async function deleteVehicleDocumentAction(vehicleId: string, documentId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("vehicle_documents").delete().eq("id", documentId);
  revalidatePath(`/vehicles/${vehicleId}`);
}
